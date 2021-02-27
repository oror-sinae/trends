var LETTER_LIST = [
    "`",
    1, 2, 3, 4, 5, 6, 7, 8, 9, 0,
    "-", "=",
    "~", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "+",
    "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\",
    "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'",
    "z", "x", "c", "v", "b", "n", "m", ",", ".", "/",
    "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "{", "}", "|",
    "A", "S", "D", "F", "G", "H", "J", "K", "L", ":", "\"",
    "Z", "X", "C", "V", "B", "N", "M", "<", ">", "?",
];
function scrambleText(el, text, times) {
    var length = el.innerText.length;
    var loop = 0;
    var interval = setInterval(function () {
        if (loop++ < times) {
            var typo = '';
            for (var i = 0; i < length; i++) {
                typo += LETTER_LIST[Math.floor(Math.random() * LETTER_LIST.length)];
            }
            el.innerText = typo;
            if (length > text.length) {
                length--;
            }
            else if (length < text.length) {
                length++;
            }
        }
        else {
            clearInterval(interval);
            el.innerText = text;
        }
    }, 50);
}
var App = /** @class */ (function () {
    function App() {
        var _this = this;
        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext('2d');
        this.pixelRatio = window.devicePixelRatio > 1 ? 2 : 1;
        this.stageWidth = document.body.clientWidth;
        this.stageHeight = document.body.clientHeight;
        this.images = document.getElementsByTagName('img');
        this.index = 0;
        this.orientation = ['diagonal', 'line', 'tape', 'curve', 'triangle', 'circle'];
        this.typeNum = 0;
        this.typeName = this.orientation[this.typeNum];
        this.density = 2;
        this.clicked = false;
        this.el = document.querySelector('p');
        this.text = this.images[this.index].src.split('/')[this.images[this.index].src.split('/').length - 1].split('.jpg')[0];
        this.resize();
        this.onClick();
        window.addEventListener('resize', this.resize.bind(this));
        window.addEventListener('click', this.onClick.bind(this));
        var btns = document.getElementsByTagName('button');
        var _loop_1 = function (btn) {
            btn.onclick = function () { _this.typeName = btn.innerText; };
        };
        for (var _i = 0, btns_1 = btns; _i < btns_1.length; _i++) {
            var btn = btns_1[_i];
            _loop_1(btn);
        }
    }
    App.prototype.resize = function () {
        this.stageWidth = document.body.clientWidth;
        this.stageHeight = document.body.clientHeight;
        this.canvas.width = this.stageWidth * this.pixelRatio;
        this.canvas.height = this.stageHeight * this.pixelRatio;
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
        this.pixels = [];
        for (var height = 0; height < this.canvas.width; height += this.density) {
            for (var width = 0; width < this.canvas.width; width += this.density) {
                this.pixels.push({ x: width, y: height });
            }
        }
        this.visual = new Visual(this.pixels, this.ctx, setColor(this.images[0]), "curve");
    };
    App.prototype.animate = function () {
        if (this.clicked) {
            if (this.visual.animate()) {
                window.requestAnimationFrame(this.animate.bind(this));
            }
            else {
                this.clicked = false;
                this.onClick();
            }
        }
    };
    App.prototype.onClick = function () {
        this.clicked = !this.clicked;
        if (this.clicked) {
            this.index = this.index < this.images.length ? this.index : 0;
            // this.typeNum = this.index == 0 ? Math.floor(Math.random() * this.orientation.length) : this.typeNum;
            // this.typeName = this.orientation[this.typeNum]
            this.text = this.images[this.index].src.split('/')[this.images[this.index].src.split('/').length - 1].split('.jpg')[0];
            scrambleText(this.el, this.text, 10);
            this.visual = new Visual(this.pixels, this.ctx, setColor(this.images[this.index++]), this.typeName);
            setTimeout(this.animate.bind(this), 1000);
        }
    };
    return App;
}());
function setColor(img) {
    var tmpCanvas = document.createElement('canvas');
    var tmpCtx = tmpCanvas.getContext('2d');
    tmpCanvas.width = img.width;
    tmpCanvas.height = img.height;
    tmpCtx.drawImage(img, 0, 0);
    // return { colorCtx: tmpCtx, width: tmpCanvas.width, height: tmpCanvas.height }
    return tmpCtx;
}
var Visual = /** @class */ (function () {
    function Visual(pixels, ctx, colorCtx, orientation //: 'diagonal' | 'line' | 'tape' | 'curve' | 'triangle' | 'circle'
    ) {
        this.pixels = pixels;
        this.ctx = ctx;
        this.colorCtx = colorCtx;
        this.orientation = orientation;
        this.vertice = [];
        this.loop = 0;
        if (this.orientation === 'diagonal' || this.orientation === 'line' || this.orientation === 'tape') {
            this.maxVertice = 2;
            this.maxScale = 32;
            this.maxDraw = 2;
            this.maxGap = 1048;
            this.stepVertice = 0;
            this.stepScale = -0.5;
            this.stepDraw = 2;
            this.stepGap = -8;
            this.type = Math.round(Math.random());
        }
        else if (this.orientation === 'curve') {
            this.maxVertice = 5;
            this.maxScale = 10;
            this.maxDraw = 1;
            this.maxGap = 2048;
            this.stepVertice = -0.02;
            this.stepScale = 0;
            this.stepDraw = 2;
            this.stepGap = -768;
        }
        else if (this.orientation === 'triangle') {
            this.maxVertice = 3;
            this.maxScale = 10;
            this.maxDraw = 10;
            this.maxGap = 500;
            this.stepVertice = 0;
            this.stepScale = 0;
            this.stepDraw = 1;
            this.stepGap = -2;
        }
        else if (this.orientation === 'circle') {
            this.maxVertice = 1;
            this.maxScale = 512;
            this.maxDraw = 10;
            this.maxGap = 0;
            this.stepVertice = 0;
            this.stepScale = -20;
            this.stepDraw = 10;
            this.stepGap = 0;
        }
    }
    Visual.prototype.getRandomVertex = function (prev) {
        if (this.orientation === 'diagonal') {
            var gab = Math.random() > 1 / 2 ?
                (Math.random() * this.maxGap / 3 + this.maxGap * 2 / 3) :
                -(Math.random() * this.maxGap / 3 + this.maxGap * 2 / 3);
            var x = prev.x + gab;
            var y = this.type ? prev.y + gab : prev.y - gab;
            return { x: x, y: y };
        }
        else if (this.orientation === 'line') {
            var gab = Math.random() > 1 / 2 ?
                (Math.random() * this.maxGap / 3 + this.maxGap * 2 / 3) :
                -(Math.random() * this.maxGap / 3 + this.maxGap * 2 / 3);
            var x = this.type ? prev.x : prev.x + gab;
            var y = this.type ? prev.y + gab : prev.y;
            return { x: x, y: y };
        }
        else if (this.orientation === 'tape' ||
            this.orientation === 'curve' ||
            this.orientation === 'triangle' ||
            this.orientation === 'circle') {
            var gabX = Math.random() > 1 / 2 ?
                (Math.random() * this.maxGap + this.maxGap) :
                -(Math.random() * this.maxGap + this.maxGap);
            var gabY = Math.random() > 1 / 2 ?
                (Math.random() * this.maxGap + this.maxGap) :
                -(Math.random() * this.maxGap + this.maxGap);
            var x = prev.x + gabX;
            var y = prev.y + gabY;
            return { x: x, y: y };
        }
    };
    Visual.prototype.animate = function () {
        for (var loop = 0; loop < this.maxDraw; loop++) {
            var pixel = this.pixels[Math.floor(Math.random() * this.pixels.length)];
            this.vertice = [{
                    x: pixel.x,
                    y: pixel.y
                }];
            for (var i = 1; i < Math.round(this.maxVertice); i++) {
                var prev = this.vertice[i - 1];
                var cur = this.getRandomVertex(prev);
                this.vertice.push(cur);
            }
            new Particle(this.vertice, this.ctx, this.colorCtx, this.orientation, this.maxScale).animate();
        }
        if (this.orientation === 'diagonal' || this.orientation === 'line' || this.orientation === 'tape') {
            // this.maxVertice = 2;
            // this.stepVertice = 0;
            // this.maxScale = 10;
            // this.stepScale = 0;
            this.maxScale = this.maxScale + this.stepScale > 8 ? this.maxScale + this.stepScale : 8;
            this.stepScale = this.maxScale > 16 ? -0.4 : -0.2;
            this.maxDraw = this.maxDraw + this.stepDraw < 256 ? this.maxDraw + this.stepDraw : 255;
            this.stepDraw = this.loop < 192 ? 2 : -4;
            this.maxGap = this.maxGap + this.stepGap > 16 ? this.maxGap + this.stepGap : 16;
            this.stepGap = this.maxGap > 128 ? -16 : -4;
        }
        else if (this.orientation === 'curve') {
            // this.maxScale = 10;
            // this.stepScale = 0;
            this.maxVertice = this.maxVertice + this.stepVertice > 2 ? this.maxVertice + this.stepVertice : 2;
            this.stepVertice = -0.2;
            this.maxDraw = this.maxDraw + this.stepDraw < 256 ? this.maxDraw + this.stepDraw : 255;
            this.stepDraw = this.loop < 192 ? 2 : -4;
            this.maxGap = this.maxGap + this.stepGap > 16 ? this.maxGap + this.stepGap : 16;
            this.stepGap = this.maxGap > 128 ? -16 : -4;
        }
        else if (this.orientation === 'triangle') {
            // this.maxVertice = 3;
            // this.maxScale = 10;
            // this.stepVertice = 0;
            // this.stepScale = 0;
            this.maxDraw = this.maxDraw + this.stepDraw < 256 ? this.maxDraw + this.stepDraw : 255;
            this.stepDraw = this.loop < 192 ? 2 : -4;
            this.maxGap = this.maxGap + this.stepGap > 16 ? this.maxGap + this.stepGap : 16;
            this.stepGap = this.maxGap > 128 ? -16 : -4;
        }
        else if (this.orientation === 'circle') {
            // this.maxVertice = 1;
            // this.maxGap = 0;
            // this.stepVertice = 0;
            // this.stepGap = 0;
            this.maxScale = this.maxScale + this.stepScale > 8 ? this.maxScale + this.stepScale : 8;
            this.stepScale = this.maxScale > 64 ? -4 : -1;
            this.maxDraw = this.maxDraw + this.stepDraw < 256 ? this.maxDraw + this.stepDraw : 255;
            this.stepDraw = this.loop < 384 ? 256 : -2;
        }
        this.loop++;
        if (this.loop == 256) {
            return false;
        }
        else {
            return true;
        }
    };
    return Visual;
}());
var Particle = /** @class */ (function () {
    function Particle(vertice, ctx, colorCtx, orientation, maxScale) {
        this.vertice = vertice;
        this.ctx = ctx;
        this.colorCtx = colorCtx;
        this.orientation = orientation;
        this.maxScale = maxScale;
    }
    Particle.prototype.getColor = function (pixel) {
        var rgb = this.colorCtx.getImageData(pixel.x, pixel.y, 1, 1).data;
        return "rgb(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ")";
    };
    Particle.prototype.animate = function () {
        if (this.orientation === 'diagonal' ||
            this.orientation === 'line' ||
            this.orientation === 'tape' ||
            this.orientation === 'curve') {
            var meanX = 0;
            var meanY = 0;
            for (var _i = 0, _a = this.vertice; _i < _a.length; _i++) {
                var vertex = _a[_i];
                meanX += vertex.x;
                meanY += vertex.y;
            }
            meanX = Math.round(meanX / this.vertice.length);
            meanY = Math.round(meanY / this.vertice.length);
            this.ctx.beginPath();
            this.ctx.lineCap = "round";
            this.ctx.lineWidth = this.maxScale;
            this.ctx.strokeStyle = this.getColor({ x: this.vertice[0].x, y: this.vertice[0].y });
            this.ctx.moveTo(this.vertice[0].x, this.vertice[0].y);
            if (this.orientation === 'curve') {
                for (var i = 1; i < this.vertice.length; i++) {
                    var prev = this.vertice[i - 1];
                    var cur = this.vertice[i];
                    var cx = (prev.x * 1 + cur.x) / 2;
                    var cy = (prev.y * 1 + cur.y) / 2;
                    // this.ctx.quadraticCurveTo(prev.x, prev.y, cx, cy)
                    this.ctx.bezierCurveTo(prev.x, prev.y, cur.x, cur.y, cx, cy);
                }
            }
            else {
                this.ctx.lineTo(this.vertice[1].x, this.vertice[1].y);
            }
            this.ctx.stroke();
        }
        else if (this.orientation === 'triangle') {
            var meanX = 0;
            var meanY = 0;
            for (var _b = 0, _c = this.vertice; _b < _c.length; _b++) {
                var vertex = _c[_b];
                meanX += vertex.x;
                meanY += vertex.y;
            }
            meanX = Math.round(meanX / this.vertice.length);
            meanY = Math.round(meanY / this.vertice.length);
            this.ctx.beginPath();
            this.ctx.lineCap = "butt";
            this.ctx.fillStyle = this.getColor({ x: this.vertice[0].x, y: this.vertice[0].y });
            this.ctx.moveTo(this.vertice[0].x, this.vertice[0].y);
            for (var i = 1; i < this.vertice.length; i++) {
                var vertex = this.vertice[i];
                this.ctx.lineTo(vertex.x, vertex.y);
            }
            this.ctx.fill();
        }
        else if (this.orientation === 'circle') {
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.getColor(this.vertice[0]);
            this.ctx.arc(this.vertice[0].x, this.vertice[0].y, this.maxScale, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    };
    return Particle;
}());
window.onload = function () {
    new App();
};
