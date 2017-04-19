namespace engine {

    export var currentX : number;
    export var currentY : number;
    export var lastX : number;
    export var lastY : number;

    export let run = (canvas: HTMLCanvasElement) => {

        var stage = new DisplayObjectContainer();
        let context2D = canvas.getContext("2d");
        let lastNow = Date.now();
        let frameHandler = () => {
            let now = Date.now();
            let deltaTime = now - lastNow;
            Ticker.getInstance().notify(deltaTime);
            context2D.clearRect(0, 0, 400, 400);
            context2D.save();
            stage.draw(context2D);
            context2D.restore();
            lastNow = now;
            window.requestAnimationFrame(frameHandler);
        }

        window.requestAnimationFrame(frameHandler);

        var isMouseDown = false;//检测鼠标是否按下
        var hitResult : DisplayObject = null;//检测是否点到控件

        window.onmousedown = (e)=>{
            
            isMouseDown = true;
            hitResult = stage.hitTest(e.offsetX, e.offsetY);
            currentX = e.offsetX;
            currentY = e.offsetY;
            
            if(hitResult) {//遍历点击事件
                for(let event of hitResult.eventArray) {
                    if(event.type == TouchEvent.TOUCH_BEGIN) {
                        event.func(e);
                    }
                }

                var parent = hitResult.parent;

                while(parent) {//遍历父容器点击事件
                    for(let event of parent.eventArray) {
                        if(event.type == TouchEvent.TOUCH_BEGIN) {
                            event.func(e);
                        }
                    }
                    parent = parent.parent;
                }

            }

        }

        window.onmousemove = (e)=>{
            
            lastX = currentX;
            lastY = currentY;
            currentX = e.offsetX;
            currentY = e.offsetY;

            if (isMouseDown) {

                if(hitResult) {//遍历点击事件
                    for(let event of hitResult.eventArray) {
                        if(event.type == TouchEvent.TOUCH_MOVE) {
                            event.func(e);
                        }
                    }

                    var parent = hitResult.parent;

                    while(parent) {//遍历父容器点击事件
                        for(let event of parent.eventArray) {
                            if(event.type == TouchEvent.TOUCH_MOVE) {
                                event.func(e);
                            }
                        }
                        parent = parent.parent;
                    }
                }
            }
        }

        window.onmouseup = (e)=>{

            isMouseDown = false;
            let newHitRusult = stage.hitTest(e.offsetX, e.offsetY)

            if(hitResult) {//遍历点击事件
                for(let event of hitResult.eventArray) {//遍历物体事件
                    if(event.type == TouchEvent.TOUCH_END) {
                        event.func(e);
                    }else if(event.type == TouchEvent.TOUCH_TAP && newHitRusult == hitResult) {
                        event.func(e);
                    }
                }

                var parent = hitResult.parent;

                while(parent) {//遍历父容器点击事件
                    for(let event of parent.eventArray) {
                        if(event.type == TouchEvent.TOUCH_END) {
                            event.func(e);
                        }else if(event.type == TouchEvent.TOUCH_TAP) {
                            var sameflag = false;
                            var newparent = newHitRusult.parent;
                            while(newparent) {
                                if(newparent == parent) {
                                    sameflag = true;
                                }
                                newparent = newparent.parent;
                            }

                            if(sameflag) {
                                event.func(e);
                            }
                        }
                    }
                    parent = parent.parent;
                }

            }

            hitResult = null;
        }

        return stage;

    }

}
