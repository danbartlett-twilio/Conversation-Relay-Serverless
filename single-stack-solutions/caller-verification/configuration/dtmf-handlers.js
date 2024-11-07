module.exports = {
    handlers: {
        '0': {
            description: 'Transfer to agent',
            function: 'live-agent-handoff',
            message: 'Transferring you to an agent now.'
        }
    },
    default: {
        message: 'Press 0 at any time to transfer to an agent.'
    }
};
