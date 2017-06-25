declare class EventSource {
  constructor (url: string, opts?: { withCredentials: boolean });
  addEventListener: (type: string, handler: (event: MessageEvent) => void)
    => void;
}

let eventSource = new EventSource("/chat/events");
eventSource.addEventListener('test', (e) => {
    console.log(e);
    let par = document.createElement("p");
    par.innerHTML = e.data;
    document.querySelector('body')!.appendChild(par);
});
