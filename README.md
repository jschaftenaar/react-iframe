# React-Iframe

React Iframe with a cross domain communication mechanism build on top of [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)


## Installing

```
npm install @jschaftenaar/react-iframe --save-dev
```

## API

The message is an object containing a procedure and arguments.
```
{
  procedure: 'example'
  arguments: ['arg1','arg2']
}
```

### iframed javascript example
```
        (function(window) {
            var origin = '*';
            let previousHeight = 0;
            function getHeight() {
                var
                    body = document.body,
                    html = document.documentElement,
                    bodyHeight = Math.max(body.scrollHeight, body.offsetHeight),
                    htmlHeight = Math.max(html.scrollHeight, html.offsetHeight),
                    height = html.clientHeight,
                    diff1 = Math.abs(bodyHeight - height),
                    diff2 = Math.abs(htmlHeight - bodyHeight);
                if (diff2>diff1) {
                    return height;
                }
                if (diff1>diff2) {
                    return bodyHeight;
                }
                if (height > bodyHeight) {
                    return bodyHeight;
                }
                return height;
            }
            function setHeight() {
                var height = getHeight();
                window.parent.postMessage(JSON.stringify({procedure: 'setHeight', arguments:[height+'px']}), origin);
            }
            function observer() {
                const currentHeight = getHeight();
                if (previousHeight !== currentHeight) {
                    setHeight();
                    previousHeight = currentHeight;
                }
            }
            function startObserver(){
                setInterval(observer, 50);
            }
            function stopObserver() {
                clearInterval(observer);
            }
            startObserver();
            window.addEventListener("beforeunload", function(event) {
                stopObserver();
                window.parent.postMessage(JSON.stringify({procedure: 'setHeight', arguments:['calc(100vh - 55px)']}), origin);
            });
            window.addEventListener("message", function(event) {
                if (event.origin==origin || origin=='*') {
                    try {
                        const message = JSON.parse(event.data);
                        switch (message.procedure) {
                            case 'setOrigin':
                                origin = message.arguments[0];
                            break;
                            case 'resized':
                                //
                            break;
                        }
                    }
                    catch (error) {
                        // silent
                    }
                }
            }, false);
        }(this));
```