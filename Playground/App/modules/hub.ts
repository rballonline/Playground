

export interface SignalR {
    siteHub: any;
}

export class Hub {

    constructor() {
        //var hub = $.connection.siteHub;
        $.connection.hub.start().done(() => {
        });
    }
} 