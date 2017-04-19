namespace engine {


    type MovieClipData = {

        name: string,
        frames: MovieClipFrameData[]
    }

    type MovieClipFrameData = {
        "image": string
    }


    export interface Drawable {
        draw(context2D: CanvasRenderingContext2D);
    }

    export abstract class DisplayObject implements Drawable {

        x = 0;

        y = 0;

        scaleX = 1;

        scaleY = 1;

        rotation = 0;

        alpha = 1;

        globalAlpha = 1;

        localMatrix: Matrix = null;

        globalMatrix: Matrix = null;

        parent: DisplayObjectContainer = null;

        touchEnabled: boolean = false;

        eventArray : Event[] = [];

        tweenCount : number = null;

        constructor() {
            this.localMatrix = new Matrix();
            this.globalMatrix = new Matrix();
        }

        // 模板方法模式        
        draw(context2D: CanvasRenderingContext2D) {
            this.localMatrix.updateFromDisplayObject(this.x, this.y, this.scaleX, this.scaleY, this.rotation);
            if (this.parent) {
                this.globalMatrix = matrixAppendMatrix(this.localMatrix, this.parent.globalMatrix);
            }
            else {
                this.globalMatrix = this.localMatrix;
            }
            context2D.setTransform(this.globalMatrix.a, this.globalMatrix.b, this.globalMatrix.c, this.globalMatrix.d, this.globalMatrix.tx, this.globalMatrix.ty);

            if (this.parent) {
                this.globalAlpha = this.parent.globalAlpha * this.alpha;
            }
            else {
                this.globalAlpha = this.alpha;
            }
            context2D.globalAlpha = this.globalAlpha;
            this.render(context2D);

        }

        abstract hitTest(x: number, y: number): DisplayObject;

        abstract render(context2D: CanvasRenderingContext2D);

        addEventListener(type : number, func : Function, targetDisplayObject : any){
        
            let e = new Event(type, func, targetDisplayObject, false);
            this.eventArray.push(e);
            EventManager.getInstance().targetDisplayObjcetArray.push(this);
        }

        removeEventListener(type : number, func : Function, targetDisplayObject : any) {
            for(let event of this.eventArray) {
                if(event.type == type && event.func == func && event.targetDisplayObject == targetDisplayObject) {
                    var index = this.eventArray.indexOf(event);
                    this.eventArray.splice(index,1);
                }   
            }
        }


    }


    export class Bitmap extends DisplayObject {

        texture: HTMLImageElement;


        render(context2D: CanvasRenderingContext2D) {
            context2D.drawImage(this.texture, 0, 0);
        }

        hitTest(x: number, y: number) {

            if(!this.touchEnabled) {
                return null;
            }

            let rect = new Rectangle();
            rect.x = rect.y = 0;
            rect.width = this.texture.width;
            rect.height = this.texture.height;
            if (rect.isPointInRectangle(new Point(x, y))) {
                return this;
            }
            else {
                return null;
            }
        }
    }


    var fonts = {

        "name": "Arial",
        "font": {
            "A": [0, 0, 0, 0, 1, 0, 0, 1, 1, 0],
            "B": []
        }

    }

    export class TextField extends DisplayObject {

        text: string = "";

        private _measureTextWidth: number = 0;

        render(context2D: CanvasRenderingContext2D) {
            context2D.fillText(this.text, 0, 10);
            this._measureTextWidth = context2D.measureText(this.text).width;
        }

        hitTest(x: number, y: number) {

            if(!this.touchEnabled) {
                return null;
            }

            var rect = new Rectangle();
            rect.width = this._measureTextWidth;
            rect.height = 20;
            var point = new Point(x, y);
            if (rect.isPointInRectangle(point)) {
                return this;
            }
            else {
                return null;
            }
        }
    }

    export enum GraphicType{
        RECT = 0
    }

    export class GraphicInfo {
        type:number;

        x:number = null;
        y:number = null;
        width:number = null;
        height:number = null;
        
        public constructor(type:number) {
            this.type = type;
        }
    }

    export class RectInfo extends GraphicInfo {
        
        public constructor(x:number,y:number,width:number,height:number) {
            super(GraphicType.RECT);
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
    }

    export class Graphics {

        alpha:number = null;
        color:string = null;

        graphicInfoList:GraphicInfo[] = [];

        beginFill(color:string,alpha:number) {
            this.graphicInfoList = [];
            this.color = color;
            this.alpha = alpha;
        }

        drawRect(x:number,y:number,width:number,height:number) {
            this.graphicInfoList.push(new RectInfo(x,y,width,height));
        }

        endFill() {

        }
        

    }

    export class Shape extends DisplayObject {
        graphics = new Graphics();

        public constructor() {
            super();
        }

        render(context2D:CanvasRenderingContext2D) {
            context2D.fillStyle = this.graphics.color;

            for(let info of this.graphics.graphicInfoList){

                var _alpha = context2D.globalAlpha;
                context2D.globalAlpha *= this.graphics.alpha;
            
                switch(info.type) {
                    case GraphicType.RECT:
                        context2D.fillRect(info.x,info.y,info.width,info.height);
                        break;

                    default:
                        console.log("error GraphicType in render:" + info.type);
                }

                context2D.globalAlpha = _alpha;

            }
        }

        hitTest(x: number, y: number) {

            if(!this.touchEnabled) {
                return null;
            }

            let rect = new Rectangle();

            for(let info of this.graphics.graphicInfoList){            
                switch(info.type) {
                    case GraphicType.RECT:
                        rect.width = info.width;
                        rect.height = info.height;
                        if (rect.isPointInRectangle(new Point(x-info.x, y-info.y))) {
                            return this;
                        }

                    default:
                        console.log("error GraphicType in hitTest:" + info.type);

                }
            }

            return null;
            
        }

    }

    export class DisplayObjectContainer extends DisplayObject {

        children: DisplayObject[] = [];

        render(context2D) {
            for (let drawable of this.children) {
                drawable.draw(context2D);
            }
        }

        addChild(child: DisplayObject) {
            this.children.push(child);
            child.parent = this;
        }

        removeChild(target:DisplayObject) {
            for(let child of this.children) {
                if(child == target) {
                    var index = this.children.indexOf(child);
                    this.children.splice(index,1);
                }
            }
        }

        hitTest(x, y) {

            if(!this.touchEnabled) {
                return null;
            }

            for (let i = this.children.length - 1; i >= 0; i--) {
                let child = this.children[i];
                let point = new Point(x, y);
                let invertChildLocalMatrix = invertMatrix(child.localMatrix);
                let pointBaseOnChild = pointAppendMatrix(point, invertChildLocalMatrix);
                let hitTestResult = child.hitTest(pointBaseOnChild.x, pointBaseOnChild.y);
                if (hitTestResult) {
                    return hitTestResult;
                }
            }
            return null;
        }

    }


    class MovieClip extends Bitmap {

        private advancedTime: number = 0;

        private static FRAME_TIME = 20;

        private static TOTAL_FRAME = 10;

        private currentFrameIndex: number;

        private data: MovieClipData;

        constructor(data: MovieClipData) {
            super();
            this.setMovieClipData(data);
            this.play();
        }

        ticker = (deltaTime) => {
            // this.removeChild();
            this.advancedTime += deltaTime;
            if (this.advancedTime >= MovieClip.FRAME_TIME * MovieClip.TOTAL_FRAME) {
                this.advancedTime -= MovieClip.FRAME_TIME * MovieClip.TOTAL_FRAME;
            }
            this.currentFrameIndex = Math.floor(this.advancedTime / MovieClip.FRAME_TIME);

            let data = this.data;

            let frameData = data.frames[this.currentFrameIndex];
            let url = frameData.image;
        }

        play() {
            Ticker.getInstance().register(this.ticker);
        }

        stop() {
            Ticker.getInstance().unregister(this.ticker)
        }

        setMovieClipData(data: MovieClipData) {
            this.data = data;
            this.currentFrameIndex = 0;
            // 创建 / 更新 

        }
    }

}