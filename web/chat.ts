// Apparently, TypeScript doesn't have EventSource in its standard
// libraries yet? So we declare what we need here.
declare class EventSource {
  constructor (url: string, opts?: { withCredentials: boolean });
  addEventListener: (type: string, handler: (event: MessageEvent) => void)
    => void;
}

document.addEventListener("DOMContentLoaded", () => {
    let incomingList = document.querySelector("#incoming") as HTMLElement;
    let outgoingForm = document.querySelector("form")!;
    let outgoingBox = document.querySelector("#outgoing") as HTMLInputElement;

    // Add a message to our chat log.
    function addMessage(who: string, msg: string) {
        let li = document.createElement("li");

        // Author.
        let whoSpan = document.createElement("span");
        whoSpan.classList.add('who');
        whoSpan.innerText = who;
        li.appendChild(whoSpan);

        // Message text.
        let msgText = document.createTextNode(msg);
        li.appendChild(msgText);

        incomingList.appendChild(li);
    }

    // Wait for incoming messages.
    let eventSource = new EventSource("/chat/messages");
    eventSource.addEventListener('message', (e) => {
        addMessage('bot', e.data);
    });

    // Send outgoing messages.
    outgoingForm.addEventListener("submit", (e) => {
        // Get the message from the text box and add to log.
        let message = outgoingBox.value;
        addMessage('you', message);

        // Send the message to the server.
        fetch(outgoingForm.target, {
            method: 'POST',
            body: message,
        });

        // Clear input. No normal form submission.
        outgoingBox.value = '';
        e.preventDefault();
    });
});
