const child_process = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const getCloudFormationOuputValue = (key) => {
  const command = `
    aws cloudformation describe-stacks \
        --stack-name CR-MULTI-USE-CASE \
        --no-paginate \
        --no-cli-pager \
        --output text \
        --query "Stacks[0].Outputs[?OutputKey=='${key}'].OutputValue"
    `;
  return child_process.execSync(command);
};

// const profilesAPI = getCloudFormationOuputValue("GetProfilesAPI");
// console.log(profilesAPI.toString()); //Buffer

const clearEnvFile = (targetFilePath) => {
  fs.writeFile(targetFilePath, "", (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(".env file cleared");
    }
  });
};

// Function to write a specific variable to another .env file
function writeEnvVariableToFile(variableKey, variableValue, targetFilePath) {
  const envLine = `${variableKey}="${variableValue}"\n`;
  fs.appendFileSync(targetFilePath, envLine, "utf8");
  console.log(`Successfully wrote ${variableValue} to ${targetFilePath}`);
}

const envPath = path.resolve(path.join(__dirname, "../.env"));

const writeOutPuts = () => {
  const REACT_APP_GET_PROFILE_URL = getCloudFormationOuputValue(
    "GetProfilesAPI"
  )
    .toString()
    .replace(/(\r\n|\n|\r)/gm, "");
  const REACT_APP_GET_USE_CASE_URL = getCloudFormationOuputValue(
    "GetUseCasesAPI"
  )
    .toString()
    .replace(/(\r\n|\n|\r)/gm, "");
  const REACT_APP_UPDATE_USE_CASE_URL = getCloudFormationOuputValue(
    "UpdateUseCasesAPI"
  )
    .toString()
    .replace(/(\r\n|\n|\r)/gm, "");
  const REACT_APP_REGISTER_VOICE_CLIENT_URL = getCloudFormationOuputValue(
    "RegisterVoiceClientAPI"
  )
    .toString()
    .replace(/(\r\n|\n|\r)/gm, "");
  const REACT_APP_REFRESH_APARTMENTS_URL = getCloudFormationOuputValue(
    "RefreshApartmentsAPI"
  )
    .toString()
    .replace(/(\r\n|\n|\r)/gm, "");
  const REACT_APP_UI_WEB_SOCKET_URL = getCloudFormationOuputValue(
    "UIWebsocketURL"
  )
    .toString()
    .replace(/(\r\n|\n|\r)/gm, "");

  // Clear .env Path first
  clearEnvFile(envPath);

  // Write Outputs to .env file
  writeEnvVariableToFile(
    "REACT_APP_GET_PROFILE_URL",
    REACT_APP_GET_PROFILE_URL,
    envPath
  );
  writeEnvVariableToFile(
    "REACT_APP_GET_USE_CASE_URL",
    REACT_APP_GET_USE_CASE_URL,
    envPath
  );
  writeEnvVariableToFile(
    "REACT_APP_UPDATE_USE_CASE_URL",
    REACT_APP_UPDATE_USE_CASE_URL,
    envPath
  );
  writeEnvVariableToFile(
    "REACT_APP_REGISTER_VOICE_CLIENT_URL",
    REACT_APP_REGISTER_VOICE_CLIENT_URL,
    envPath
  );
  writeEnvVariableToFile(
    "REACT_APP_REFRESH_APARTMENTS_URL",
    REACT_APP_REFRESH_APARTMENTS_URL,
    envPath
  );
  writeEnvVariableToFile(
    "REACT_APP_UI_WEB_SOCKET_URL",
    REACT_APP_UI_WEB_SOCKET_URL,
    envPath
  );
};

writeOutPuts();
