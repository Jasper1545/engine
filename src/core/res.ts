namespace engine {

    export namespace RES {
        var RESOURCE_PATH = "././Resources/";
        export function getRes(name: string):HTMLImageElement {
            var result = document.createElement("img");
            result.src = RESOURCE_PATH + name;
            return result;  
        }

/*
        export function getRes(name: string) {
            return new Promise(function (resolve, reject) {
                var result = new Image();
                result.src = RESOURCE_PATH + name;
                result.onload = () => {
                    resolve(result);
                }
            });
        }
    }
    }
*/

    }
}