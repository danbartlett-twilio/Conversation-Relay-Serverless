import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn"; 
const sfnClient = new SFNClient({ region: process.env.AWS_REGION });

/**
 * invokeStateMachine
 * 
 * This function handles tool (function) calls made by the LLM. The
 * state machine can automatically handle parallel calls if needed. 
 * A tool call is mapped to a specific lambda function. Once all of the 
 * lambdas have completed, the state machine publishes to a SNS topics
 * which invokes this same lambda function (ws/default) for processing
 * post tool call(s).
 */
export async function invokeStateMachine(tool_calls_object, connectionId, callConnection, ws_domain_name, ws_stage) {

    const tool_calls = Object.values(tool_calls_object).map(tool => {                
        return { 
            ...tool, 
            ws_connectionId: connectionId, 
            ws_domain_name: ws_domain_name,
            ws_stage: ws_stage,
            userContext: callConnection.Item.userContext,
            call_details: {
                to_phone: callConnection.Item.To,
                from_phone: callConnection.Item.From,
                twilio_call_sid: callConnection.Item.CallSid,
                twilio_account_sid: callConnection.Item.AccountSid                            
            },
            // The name of the tool call MUST align with a Lambda function that has the SAME name
            // The name of any lambdas being called MUST be added to the resource for this
            // state machine in the template.yaml file so that the state machine has permission
            // to invoke the lambda.
            lambdaArn: `arn:aws:lambda:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:function:${tool.function.name}`
        };                                                
    });          

    // Invoke the State Machine for tool call(s)
    let stateMachineInput = {
        Payload: {
            tool_calls: tool_calls                        
        }
    };

    let stepFuncCommand = new StartExecutionCommand({
        stateMachineArn: process.env.TOOL_CALL_STATE_MACHINE,
        input: JSON.stringify(stateMachineInput)                    
    });

    let stepFuncResponse = await sfnClient.send(stepFuncCommand);

    console.log ("stepFuncResponse => ", stepFuncResponse);
    
    return true;
}