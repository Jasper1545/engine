namespace engine {

    export type Ticker_Listener_Type = (deltaTime: number) => void;

    export class Ticker {

        private static instance: Ticker;

        static getInstance() {
            if (!Ticker.instance) {
                Ticker.instance = new Ticker();
            }
            return Ticker.instance;
        }

        listeners: Ticker_Listener_Type[] = [];

        register(listener: Ticker_Listener_Type) {
            this.listeners.push(listener);
        }

        unregister(listener: Ticker_Listener_Type) {

        }

        notify(deltaTime: number) {
            for (let listener of this.listeners) {
                listener(deltaTime);
            }
        }

    }

    export class Timer {
        private timeCounter:number = 0;
        
        private interval:number = null;
        private fullCount:number = null;
        private currentCount:number = 0;

        private isOn:boolean = false;

        private eventList:Event[] = [];
        
        public constructor(interval:number,fullCount:number) {
            this.interval = interval;
            this.fullCount = fullCount;

            engine.Ticker.getInstance().register((deltaTime) => {
                if(this.isOn){
                    this.timeCounter += deltaTime;
                    if(this.timeCounter >= interval){
                        for(let event of this.eventList){
                            if(event.type == TimerEvent.TIMER) {
                                event.func.call(event.targetDisplayObject);
                            }
                        }
                        this.timeCounter = 0;
                        if(this.fullCount != 0) {
                            this.currentCount++;
                            if(this.currentCount >= this.fullCount) {
                                this.stop();
                            }
                        }
                    }
                } 
            });
        }

        public start() {
            this.isOn = true;
        }

        public stop() {
            this.isOn = false;
        }

        addEventListener(type : number, func : Function, targetDisplayObject : any){
            console.log("targetX:" + targetDisplayObject);
            let e = new Event(type, func, targetDisplayObject, false);
            this.eventList.push(e);
        }

        removeEventListener(type : number, func : Function, targetDisplayObject : any) {
            for(let event of this.eventList) {
                if(event.type == type && event.func == func && event.targetDisplayObject == targetDisplayObject) {
                    var index = this.eventList.indexOf(event);
                    this.eventList.splice(index,1);
                }   
            }
        }

    }

    export function setTimeout(func:Function,target,delay:number) {
        var timer = new Timer(delay,1);
        timer.addEventListener(engine.TimerEvent.TIMER,function() {
            func.call(target);
        },this)
    }

}