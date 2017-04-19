namespace engine {

	export enum TouchEvent{
    	TOUCH_BEGIN = 0,
    	TOUCH_END = 1,
    	TOUCH_TAP = 2,
		TOUCH_MOVE = 3
	}

    export enum TimerEvent{
        TIMER = 0
    }

    export class Event{
        
        type:number;
        ifCapture = false;
        targetDisplayObject : DisplayObject;
        func : Function;

        constructor(type : number, func : Function, targetDisplayObject : DisplayObject, ifCapture : boolean){
            
            this.type = type;
            this.ifCapture = ifCapture;
            this.func = func;
            this.targetDisplayObject = targetDisplayObject;

        }
    }
    
    export class EventManager{
        
        targetDisplayObjcetArray : DisplayObject[];
        static eventManager : EventManager;
    
        static getInstance(){
            
            if(EventManager.eventManager == null){
                
                EventManager.eventManager = new EventManager();
                EventManager.eventManager.targetDisplayObjcetArray = new Array();
                return EventManager.eventManager;

           }else{

            return EventManager.eventManager;
           }
       }
    }
    
}