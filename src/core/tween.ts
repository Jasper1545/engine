namespace engine {

	export class Tween {

		static _tweens:Tween[] = [];
		_timer:Timer = null;
		_target:any = null;
		_callbackTarget:any = null;
		_callback:Function = null;

		_exception:number = null;
		_deltaMoveDistance:number = null;

		public static get(target:any):Tween {
			var tw = new Tween();
			tw._target = target;
			target.tweenCount++;
			Tween._tweens.push(tw);
			return tw;
		}

		public to(prop:string,exception:number,duration:number) {
			
			this._timer = new Timer(10,duration/10);
			this._exception = exception;
			//console.log("to: target (x,y) = (" + this._target.x + "," + this._target.y + ")");
			if(prop == "x") {
				var moveDistance = exception - this._target.x;
				this._deltaMoveDistance = moveDistance/duration * 10;	
				this._timer.addEventListener(TimerEvent.TIMER,this.tweenTimerFuncX,this);
			}else if(prop == "y") {
				var moveDistance = exception - this._target.y;
				this._deltaMoveDistance = moveDistance/duration * 10;	
				this._timer.addEventListener(TimerEvent.TIMER,this.tweenTimerFuncY,this);
			}

			this._timer.start();

		}

		private tweenTimerFuncX() {
			if(this._exception - this._target.x > this._deltaMoveDistance) {
					this._target.x+=this._deltaMoveDistance;
			}else {
				this._target.x = this._exception;
				this._timer = null;
				
				if(this._callback) {	
					this._callback.call(this._callbackTarget);
				}
			}
		}

		private tweenTimerFuncY() {
			if(this._exception - this._target.y > this._deltaMoveDistance) {
					this._target.y+=this._deltaMoveDistance;
			}else {
				this._target.y = this._exception;
				this._timer = null;
				
				if(this._callback) {	
					this._callback.call(this._callbackTarget);
				}
			}
		}

		public static removeTweens(target:any) {
			console.log("tw count:" + target.tweenCount);
			if(!target.tweenCount){
				return;
			}

			var tweens = Tween._tweens;
			for(var i= tweens.length - 1; i>=0; i--) {
				if(tweens[i]._target == target) {
					console.log("find");
					tweens[i].stop();
					tweens.splice(i,1);
				}
			}
			target.tweenCount = null;
		}

		public stop() {
			this._timer.stop();
		}

		public call(callback:Function,target:any) {
			this._callback = callback;
			this._callbackTarget = target;
		}


	}	

}