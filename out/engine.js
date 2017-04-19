var engine;
(function (engine) {
    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }
    engine.Point = Point;
    class Rectangle {
        constructor() {
            this.x = 0;
            this.y = 0;
            this.width = 1;
            this.height = 1;
        }
        isPointInRectangle(point) {
            let rect = this;
            if (point.x < rect.width + rect.x &&
                point.y < rect.height + rect.y &&
                point.x > rect.x &&
                point.y > rect.y) {
                return true;
            }
            else {
                return false;
            }
        }
    }
    engine.Rectangle = Rectangle;
    function pointAppendMatrix(point, m) {
        var x = m.a * point.x + m.c * point.y + m.tx;
        var y = m.b * point.x + m.d * point.y + m.ty;
        return new Point(x, y);
    }
    engine.pointAppendMatrix = pointAppendMatrix;
    /**
     * 使用伴随矩阵法求逆矩阵
     * http://wenku.baidu.com/view/b0a9fed8ce2f0066f53322a9
     */
    function invertMatrix(m) {
        var a = m.a;
        var b = m.b;
        var c = m.c;
        var d = m.d;
        var tx = m.tx;
        var ty = m.ty;
        var determinant = a * d - b * c;
        var result = new Matrix(1, 0, 0, 1, 0, 0);
        if (determinant == 0) {
            throw new Error("no invert");
        }
        determinant = 1 / determinant;
        var k = result.a = d * determinant;
        b = result.b = -b * determinant;
        c = result.c = -c * determinant;
        d = result.d = a * determinant;
        result.tx = -(k * tx + c * ty);
        result.ty = -(b * tx + d * ty);
        return result;
    }
    engine.invertMatrix = invertMatrix;
    function matrixAppendMatrix(m1, m2) {
        var result = new Matrix();
        result.a = m1.a * m2.a + m1.b * m2.c;
        result.b = m1.a * m2.b + m1.b * m2.d;
        result.c = m2.a * m1.c + m2.c * m1.d;
        result.d = m2.b * m1.c + m1.d * m2.d;
        result.tx = m2.a * m1.tx + m2.c * m1.ty + m2.tx;
        result.ty = m2.b * m1.tx + m2.d * m1.ty + m2.ty;
        return result;
    }
    engine.matrixAppendMatrix = matrixAppendMatrix;
    var PI = Math.PI;
    var HalfPI = PI / 2;
    var PacPI = PI + HalfPI;
    var TwoPI = PI * 2;
    var DEG_TO_RAD = Math.PI / 180;
    class Matrix {
        constructor(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.tx = tx;
            this.ty = ty;
        }
        toString() {
            return "(a=" + this.a + ", b=" + this.b + ", c=" + this.c + ", d=" + this.d + ", tx=" + this.tx + ", ty=" + this.ty + ")";
        }
        updateFromDisplayObject(x, y, scaleX, scaleY, rotation) {
            this.tx = x;
            this.ty = y;
            var skewX, skewY;
            skewX = skewY = rotation / 180 * Math.PI;
            var u = Math.cos(skewX);
            var v = Math.sin(skewX);
            this.a = Math.cos(skewY) * scaleX;
            this.b = Math.sin(skewY) * scaleX;
            this.c = -v * scaleY;
            this.d = u * scaleY;
        }
    }
    engine.Matrix = Matrix;
})(engine || (engine = {}));
var engine;
(function (engine) {
    class Ticker {
        constructor() {
            this.listeners = [];
        }
        static getInstance() {
            if (!Ticker.instance) {
                Ticker.instance = new Ticker();
            }
            return Ticker.instance;
        }
        register(listener) {
            this.listeners.push(listener);
        }
        unregister(listener) {
        }
        notify(deltaTime) {
            for (let listener of this.listeners) {
                listener(deltaTime);
            }
        }
    }
    engine.Ticker = Ticker;
    class Timer {
        constructor(interval, fullCount) {
            this.timeCounter = 0;
            this.interval = null;
            this.fullCount = null;
            this.currentCount = 0;
            this.isOn = false;
            this.eventList = [];
            this.interval = interval;
            this.fullCount = fullCount;
            engine.Ticker.getInstance().register((deltaTime) => {
                if (this.isOn) {
                    this.timeCounter += deltaTime;
                    if (this.timeCounter >= interval) {
                        for (let event of this.eventList) {
                            if (event.type == engine.TimerEvent.TIMER) {
                                event.func.call(event.targetDisplayObject);
                            }
                        }
                        this.timeCounter = 0;
                        if (this.fullCount != 0) {
                            this.currentCount++;
                            if (this.currentCount >= this.fullCount) {
                                this.stop();
                            }
                        }
                    }
                }
            });
        }
        start() {
            this.isOn = true;
        }
        stop() {
            this.isOn = false;
        }
        addEventListener(type, func, targetDisplayObject) {
            console.log("targetX:" + targetDisplayObject);
            let e = new engine.Event(type, func, targetDisplayObject, false);
            this.eventList.push(e);
        }
        removeEventListener(type, func, targetDisplayObject) {
            for (let event of this.eventList) {
                if (event.type == type && event.func == func && event.targetDisplayObject == targetDisplayObject) {
                    var index = this.eventList.indexOf(event);
                    this.eventList.splice(index, 1);
                }
            }
        }
    }
    engine.Timer = Timer;
    function setTimeout(func, target, delay) {
        var timer = new Timer(delay, 1);
        timer.addEventListener(engine.TimerEvent.TIMER, function () {
            func.call(target);
        }, this);
    }
    engine.setTimeout = setTimeout;
})(engine || (engine = {}));
var engine;
(function (engine) {
    class DisplayObject {
        constructor() {
            this.x = 0;
            this.y = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.rotation = 0;
            this.alpha = 1;
            this.globalAlpha = 1;
            this.localMatrix = null;
            this.globalMatrix = null;
            this.parent = null;
            this.touchEnabled = false;
            this.eventArray = [];
            this.tweenCount = null;
            this.localMatrix = new engine.Matrix();
            this.globalMatrix = new engine.Matrix();
        }
        // 模板方法模式        
        draw(context2D) {
            this.localMatrix.updateFromDisplayObject(this.x, this.y, this.scaleX, this.scaleY, this.rotation);
            if (this.parent) {
                this.globalMatrix = engine.matrixAppendMatrix(this.localMatrix, this.parent.globalMatrix);
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
        addEventListener(type, func, targetDisplayObject) {
            let e = new engine.Event(type, func, targetDisplayObject, false);
            this.eventArray.push(e);
            engine.EventManager.getInstance().targetDisplayObjcetArray.push(this);
        }
        removeEventListener(type, func, targetDisplayObject) {
            for (let event of this.eventArray) {
                if (event.type == type && event.func == func && event.targetDisplayObject == targetDisplayObject) {
                    var index = this.eventArray.indexOf(event);
                    this.eventArray.splice(index, 1);
                }
            }
        }
    }
    engine.DisplayObject = DisplayObject;
    class Bitmap extends DisplayObject {
        render(context2D) {
            context2D.drawImage(this.texture, 0, 0);
        }
        hitTest(x, y) {
            if (!this.touchEnabled) {
                return null;
            }
            let rect = new engine.Rectangle();
            rect.x = rect.y = 0;
            rect.width = this.texture.width;
            rect.height = this.texture.height;
            if (rect.isPointInRectangle(new engine.Point(x, y))) {
                return this;
            }
            else {
                return null;
            }
        }
    }
    engine.Bitmap = Bitmap;
    var fonts = {
        "name": "Arial",
        "font": {
            "A": [0, 0, 0, 0, 1, 0, 0, 1, 1, 0],
            "B": []
        }
    };
    class TextField extends DisplayObject {
        constructor(...args) {
            super(...args);
            this.text = "";
            this._measureTextWidth = 0;
        }
        render(context2D) {
            context2D.fillText(this.text, 0, 10);
            this._measureTextWidth = context2D.measureText(this.text).width;
        }
        hitTest(x, y) {
            if (!this.touchEnabled) {
                return null;
            }
            var rect = new engine.Rectangle();
            rect.width = this._measureTextWidth;
            rect.height = 20;
            var point = new engine.Point(x, y);
            if (rect.isPointInRectangle(point)) {
                return this;
            }
            else {
                return null;
            }
        }
    }
    engine.TextField = TextField;
    (function (GraphicType) {
        GraphicType[GraphicType["RECT"] = 0] = "RECT";
    })(engine.GraphicType || (engine.GraphicType = {}));
    var GraphicType = engine.GraphicType;
    class GraphicInfo {
        constructor(type) {
            this.x = null;
            this.y = null;
            this.width = null;
            this.height = null;
            this.type = type;
        }
    }
    engine.GraphicInfo = GraphicInfo;
    class RectInfo extends GraphicInfo {
        constructor(x, y, width, height) {
            super(GraphicType.RECT);
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
    }
    engine.RectInfo = RectInfo;
    class Graphics {
        constructor() {
            this.alpha = null;
            this.color = null;
            this.graphicInfoList = [];
        }
        beginFill(color, alpha) {
            this.graphicInfoList = [];
            this.color = color;
            this.alpha = alpha;
        }
        drawRect(x, y, width, height) {
            this.graphicInfoList.push(new RectInfo(x, y, width, height));
        }
        endFill() {
        }
    }
    engine.Graphics = Graphics;
    class Shape extends DisplayObject {
        constructor() {
            super();
            this.graphics = new Graphics();
        }
        render(context2D) {
            context2D.fillStyle = this.graphics.color;
            for (let info of this.graphics.graphicInfoList) {
                var _alpha = context2D.globalAlpha;
                context2D.globalAlpha *= this.graphics.alpha;
                switch (info.type) {
                    case GraphicType.RECT:
                        context2D.fillRect(info.x, info.y, info.width, info.height);
                        break;
                    default:
                        console.log("error GraphicType in render:" + info.type);
                }
                context2D.globalAlpha = _alpha;
            }
        }
        hitTest(x, y) {
            if (!this.touchEnabled) {
                return null;
            }
            let rect = new engine.Rectangle();
            for (let info of this.graphics.graphicInfoList) {
                switch (info.type) {
                    case GraphicType.RECT:
                        rect.width = info.width;
                        rect.height = info.height;
                        if (rect.isPointInRectangle(new engine.Point(x - info.x, y - info.y))) {
                            return this;
                        }
                    default:
                        console.log("error GraphicType in hitTest:" + info.type);
                }
            }
            return null;
        }
    }
    engine.Shape = Shape;
    class DisplayObjectContainer extends DisplayObject {
        constructor(...args) {
            super(...args);
            this.children = [];
        }
        render(context2D) {
            for (let drawable of this.children) {
                drawable.draw(context2D);
            }
        }
        addChild(child) {
            this.children.push(child);
            child.parent = this;
        }
        removeChild(target) {
            for (let child of this.children) {
                if (child == target) {
                    var index = this.children.indexOf(child);
                    this.children.splice(index, 1);
                }
            }
        }
        hitTest(x, y) {
            if (!this.touchEnabled) {
                return null;
            }
            for (let i = this.children.length - 1; i >= 0; i--) {
                let child = this.children[i];
                let point = new engine.Point(x, y);
                let invertChildLocalMatrix = engine.invertMatrix(child.localMatrix);
                let pointBaseOnChild = engine.pointAppendMatrix(point, invertChildLocalMatrix);
                let hitTestResult = child.hitTest(pointBaseOnChild.x, pointBaseOnChild.y);
                if (hitTestResult) {
                    return hitTestResult;
                }
            }
            return null;
        }
    }
    engine.DisplayObjectContainer = DisplayObjectContainer;
    class MovieClip extends Bitmap {
        constructor(data) {
            super();
            this.advancedTime = 0;
            this.ticker = (deltaTime) => {
                // this.removeChild();
                this.advancedTime += deltaTime;
                if (this.advancedTime >= MovieClip.FRAME_TIME * MovieClip.TOTAL_FRAME) {
                    this.advancedTime -= MovieClip.FRAME_TIME * MovieClip.TOTAL_FRAME;
                }
                this.currentFrameIndex = Math.floor(this.advancedTime / MovieClip.FRAME_TIME);
                let data = this.data;
                let frameData = data.frames[this.currentFrameIndex];
                let url = frameData.image;
            };
            this.setMovieClipData(data);
            this.play();
        }
        play() {
            engine.Ticker.getInstance().register(this.ticker);
        }
        stop() {
            engine.Ticker.getInstance().unregister(this.ticker);
        }
        setMovieClipData(data) {
            this.data = data;
            this.currentFrameIndex = 0;
            // 创建 / 更新 
        }
    }
    MovieClip.FRAME_TIME = 20;
    MovieClip.TOTAL_FRAME = 10;
})(engine || (engine = {}));
var engine;
(function (engine) {
    var RES;
    (function (RES) {
        var RESOURCE_PATH = "././Resources/";
        function getRes(name) {
            var result = document.createElement("img");
            result.src = RESOURCE_PATH + name;
            return result;
        }
        RES.getRes = getRes;
    })(RES = engine.RES || (engine.RES = {}));
})(engine || (engine = {}));
var engine;
(function (engine) {
    (function (TouchEvent) {
        TouchEvent[TouchEvent["TOUCH_BEGIN"] = 0] = "TOUCH_BEGIN";
        TouchEvent[TouchEvent["TOUCH_END"] = 1] = "TOUCH_END";
        TouchEvent[TouchEvent["TOUCH_TAP"] = 2] = "TOUCH_TAP";
        TouchEvent[TouchEvent["TOUCH_MOVE"] = 3] = "TOUCH_MOVE";
    })(engine.TouchEvent || (engine.TouchEvent = {}));
    var TouchEvent = engine.TouchEvent;
    (function (TimerEvent) {
        TimerEvent[TimerEvent["TIMER"] = 0] = "TIMER";
    })(engine.TimerEvent || (engine.TimerEvent = {}));
    var TimerEvent = engine.TimerEvent;
    class Event {
        constructor(type, func, targetDisplayObject, ifCapture) {
            this.ifCapture = false;
            this.type = type;
            this.ifCapture = ifCapture;
            this.func = func;
            this.targetDisplayObject = targetDisplayObject;
        }
    }
    engine.Event = Event;
    class EventManager {
        static getInstance() {
            if (EventManager.eventManager == null) {
                EventManager.eventManager = new EventManager();
                EventManager.eventManager.targetDisplayObjcetArray = new Array();
                return EventManager.eventManager;
            }
            else {
                return EventManager.eventManager;
            }
        }
    }
    engine.EventManager = EventManager;
})(engine || (engine = {}));
var engine;
(function (engine) {
    class Tween {
        constructor() {
            this._timer = null;
            this._target = null;
            this._callbackTarget = null;
            this._callback = null;
            this._exception = null;
            this._deltaMoveDistance = null;
        }
        static get(target) {
            var tw = new Tween();
            tw._target = target;
            target.tweenCount++;
            Tween._tweens.push(tw);
            return tw;
        }
        to(prop, exception, duration) {
            this._timer = new engine.Timer(10, duration / 10);
            this._exception = exception;
            //console.log("to: target (x,y) = (" + this._target.x + "," + this._target.y + ")");
            if (prop == "x") {
                var moveDistance = exception - this._target.x;
                this._deltaMoveDistance = moveDistance / duration * 10;
                this._timer.addEventListener(engine.TimerEvent.TIMER, this.tweenTimerFuncX, this);
            }
            else if (prop == "y") {
                var moveDistance = exception - this._target.y;
                this._deltaMoveDistance = moveDistance / duration * 10;
                this._timer.addEventListener(engine.TimerEvent.TIMER, this.tweenTimerFuncY, this);
            }
            this._timer.start();
        }
        tweenTimerFuncX() {
            if (this._exception - this._target.x > this._deltaMoveDistance) {
                this._target.x += this._deltaMoveDistance;
            }
            else {
                this._target.x = this._exception;
                this._timer = null;
                if (this._callback) {
                    this._callback.call(this._callbackTarget);
                }
            }
        }
        tweenTimerFuncY() {
            if (this._exception - this._target.y > this._deltaMoveDistance) {
                this._target.y += this._deltaMoveDistance;
            }
            else {
                this._target.y = this._exception;
                this._timer = null;
                if (this._callback) {
                    this._callback.call(this._callbackTarget);
                }
            }
        }
        static removeTweens(target) {
            console.log("tw count:" + target.tweenCount);
            if (!target.tweenCount) {
                return;
            }
            var tweens = Tween._tweens;
            for (var i = tweens.length - 1; i >= 0; i--) {
                if (tweens[i]._target == target) {
                    console.log("find");
                    tweens[i].stop();
                    tweens.splice(i, 1);
                }
            }
            target.tweenCount = null;
        }
        stop() {
            this._timer.stop();
        }
        call(callback, target) {
            this._callback = callback;
            this._callbackTarget = target;
        }
    }
    Tween._tweens = [];
    engine.Tween = Tween;
})(engine || (engine = {}));
var engine;
(function (engine) {
    engine.run = (canvas) => {
        var stage = new engine.DisplayObjectContainer();
        let context2D = canvas.getContext("2d");
        let lastNow = Date.now();
        let frameHandler = () => {
            let now = Date.now();
            let deltaTime = now - lastNow;
            engine.Ticker.getInstance().notify(deltaTime);
            context2D.clearRect(0, 0, 400, 400);
            context2D.save();
            stage.draw(context2D);
            context2D.restore();
            lastNow = now;
            window.requestAnimationFrame(frameHandler);
        };
        window.requestAnimationFrame(frameHandler);
        var isMouseDown = false; //检测鼠标是否按下
        var hitResult = null; //检测是否点到控件
        window.onmousedown = (e) => {
            isMouseDown = true;
            hitResult = stage.hitTest(e.offsetX, e.offsetY);
            engine.currentX = e.offsetX;
            engine.currentY = e.offsetY;
            if (hitResult) {
                for (let event of hitResult.eventArray) {
                    if (event.type == engine.TouchEvent.TOUCH_BEGIN) {
                        event.func(e);
                    }
                }
                var parent = hitResult.parent;
                while (parent) {
                    for (let event of parent.eventArray) {
                        if (event.type == engine.TouchEvent.TOUCH_BEGIN) {
                            event.func(e);
                        }
                    }
                    parent = parent.parent;
                }
            }
        };
        window.onmousemove = (e) => {
            engine.lastX = engine.currentX;
            engine.lastY = engine.currentY;
            engine.currentX = e.offsetX;
            engine.currentY = e.offsetY;
            if (isMouseDown) {
                if (hitResult) {
                    for (let event of hitResult.eventArray) {
                        if (event.type == engine.TouchEvent.TOUCH_MOVE) {
                            event.func(e);
                        }
                    }
                    var parent = hitResult.parent;
                    while (parent) {
                        for (let event of parent.eventArray) {
                            if (event.type == engine.TouchEvent.TOUCH_MOVE) {
                                event.func(e);
                            }
                        }
                        parent = parent.parent;
                    }
                }
            }
        };
        window.onmouseup = (e) => {
            isMouseDown = false;
            let newHitRusult = stage.hitTest(e.offsetX, e.offsetY);
            if (hitResult) {
                for (let event of hitResult.eventArray) {
                    if (event.type == engine.TouchEvent.TOUCH_END) {
                        event.func(e);
                    }
                    else if (event.type == engine.TouchEvent.TOUCH_TAP && newHitRusult == hitResult) {
                        event.func(e);
                    }
                }
                var parent = hitResult.parent;
                while (parent) {
                    for (let event of parent.eventArray) {
                        if (event.type == engine.TouchEvent.TOUCH_END) {
                            event.func(e);
                        }
                        else if (event.type == engine.TouchEvent.TOUCH_TAP) {
                            var sameflag = false;
                            var newparent = newHitRusult.parent;
                            while (newparent) {
                                if (newparent == parent) {
                                    sameflag = true;
                                }
                                newparent = newparent.parent;
                            }
                            if (sameflag) {
                                event.func(e);
                            }
                        }
                    }
                    parent = parent.parent;
                }
            }
            hitResult = null;
        };
        return stage;
    };
})(engine || (engine = {}));
