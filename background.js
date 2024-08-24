

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'processText') {
        const { data } = message;
        console.log(data);


    }
});
