declare namespace engine {
    class Point {
        x: number;
        y: number;
        constructor(x: number, y: number);
    }
    class Rectangle {
        x: number;
        y: number;
        width: number;
        height: number;
        isPointInRectangle(point: Point): boolean;
    }
    function pointAppendMatrix(point: Point, m: Matrix): Point;
    /**
     * 使用伴随矩阵法求逆矩阵
     * http://wenku.baidu.com/view/b0a9fed8ce2f0066f53322a9
     */
    function invertMatrix(m: Matrix): Matrix;
    function matrixAppendMatrix(m1: Matrix, m2: Matrix): Matrix;
    class Matrix {
        constructor(a?: number, b?: number, c?: number, d?: number, tx?: number, ty?: number);
        a: number;
        b: number;
        c: number;
        d: number;
        tx: number;
        ty: number;
        toString(): string;
        updateFromDisplayObject(x: number, y: number, scaleX: number, scaleY: number, rotation: number): void;
    }
}
declare namespace engine {
    type Ticker_Listener_Type = (deltaTime: number) => void;
    class Ticker {
        private static instance;
        static getInstance(): Ticker;
        listeners: Ticker_Listener_Type[];
        register(listener: Ticker_Listener_Type): void;
        unregister(listener: Ticker_Listener_Type): void;
        notify(deltaTime: number): void;
    }
    class Timer {
        private timeCounter;
        private interval;
        private fullCount;
        private currentCount;
        private isOn;
        private eventList;
        constructor(interval: number, fullCount: number);
        start(): void;
        stop(): void;
        addEventListener(type: number, func: Function, targetDisplayObject: any): void;
        removeEventListener(type: number, func: Function, targetDisplayObject: any): void;
    }
    function setTimeout(func: Function, target: any, delay: number): void;
}
declare namespace engine {
    interface Drawable {
        draw(context2D: CanvasRenderingContext2D): any;
    }
    abstract class DisplayObject implements Drawable {
        x: number;
        y: number;
        scaleX: number;
        scaleY: number;
        rotation: number;
        alpha: number;
        globalAlpha: number;
        localMatrix: Matrix;
        globalMatrix: Matrix;
        parent: DisplayObjectContainer;
        touchEnabled: boolean;
        eventArray: Event[];
        tweenCount: number;
        constructor();
        draw(context2D: CanvasRenderingContext2D): void;
        abstract hitTest(x: number, y: number): DisplayObject;
        abstract render(context2D: CanvasRenderingContext2D): any;
        addEventListener(type: number, func: Function, targetDisplayObject: any): void;
        removeEventListener(type: number, func: Function, targetDisplayObject: any): void;
    }
    class Bitmap extends DisplayObject {
        texture: HTMLImageElement;
        render(context2D: CanvasRenderingContext2D): void;
        hitTest(x: number, y: number): this;
    }
    class TextField extends DisplayObject {
        text: string;
        private _measureTextWidth;
        render(context2D: CanvasRenderingContext2D): void;
        hitTest(x: number, y: number): this;
    }
    enum GraphicType {
        RECT = 0,
    }
    class GraphicInfo {
        type: number;
        x: number;
        y: number;
        width: number;
        height: number;
        constructor(type: number);
    }
    class RectInfo extends GraphicInfo {
        constructor(x: number, y: number, width: number, height: number);
    }
    class Graphics {
        alpha: number;
        color: string;
        graphicInfoList: GraphicInfo[];
        beginFill(color: string, alpha: number): void;
        drawRect(x: number, y: number, width: number, height: number): void;
        endFill(): void;
    }
    class Shape extends DisplayObject {
        graphics: Graphics;
        constructor();
        render(context2D: CanvasRenderingContext2D): void;
        hitTest(x: number, y: number): this;
    }
    class DisplayObjectContainer extends DisplayObject {
        children: DisplayObject[];
        render(context2D: any): void;
        addChild(child: DisplayObject): void;
        removeChild(target: DisplayObject): void;
        hitTest(x: any, y: any): DisplayObject;
    }
}
declare namespace engine {
    namespace RES {
        function getRes(name: string): HTMLImageElement;
    }
}
declare namespace engine {
    enum TouchEvent {
        TOUCH_BEGIN = 0,
        TOUCH_END = 1,
        TOUCH_TAP = 2,
        TOUCH_MOVE = 3,
    }
    enum TimerEvent {
        TIMER = 0,
    }
    class Event {
        type: number;
        ifCapture: boolean;
        targetDisplayObject: DisplayObject;
        func: Function;
        constructor(type: number, func: Function, targetDisplayObject: DisplayObject, ifCapture: boolean);
    }
    class EventManager {
        targetDisplayObjcetArray: DisplayObject[];
        static eventManager: EventManager;
        static getInstance(): EventManager;
    }
}
declare namespace engine {
    class Tween {
        static _tweens: Tween[];
        _timer: Timer;
        _target: any;
        _callbackTarget: any;
        _callback: Function;
        _exception: number;
        _deltaMoveDistance: number;
        static get(target: any): Tween;
        to(prop: string, exception: number, duration: number): void;
        private tweenTimerFuncX();
        private tweenTimerFuncY();
        static removeTweens(target: any): void;
        stop(): void;
        call(callback: Function, target: any): void;
    }
}
declare namespace engine {
    var currentX: number;
    var currentY: number;
    var lastX: number;
    var lastY: number;
    let run: (canvas: HTMLCanvasElement) => DisplayObjectContainer;
}
