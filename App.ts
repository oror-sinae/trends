const LETTER_LIST = [
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
    let length = el.innerText.length
    let loop = 0;

    const interval = setInterval(() => {
        if (loop++ < times) {
            let typo = ''
            for (let i = 0; i < length; i++) {
                typo += LETTER_LIST[Math.floor(Math.random() * LETTER_LIST.length)]
            }
            el.innerText = typo;

            if (length > text.length) {
                length--
            } else if (length < text.length) {
                length++
            }
        } else {
            clearInterval(interval);
            el.innerText = text;
        }
    }, 50)

}

class App {
    canvas = document.querySelector(`canvas`);
    ctx = this.canvas.getContext('2d');

    pixelRatio = window.devicePixelRatio > 1 ? 2 : 1;

    stageWidth = document.body.clientWidth;
    stageHeight = document.body.clientHeight;

    images = document.getElementsByTagName('img');
    index = 0;

    orientation = ['diagonal', 'line', 'tape', 'curve', 'triangle', 'circle']
    typeNum = 0;
    typeName = this.orientation[this.typeNum]

    pixels: { x: number, y: number }[];
    density = 2;

    visual;

    clicked: boolean = false;

    el = document.querySelector('p');
    text = this.images[this.index].src.split('/')[this.images[this.index].src.split('/').length - 1].split('.jpg')[0];


    constructor() {
        this.resize();
        this.onClick()
        window.addEventListener('resize', this.resize.bind(this));
        window.addEventListener('click', this.onClick.bind(this));

        const btns = document.getElementsByTagName('button')
        for (let btn of btns) {
            btn.onclick = () => { this.typeName = btn.innerText; }
        }

    }

    resize() {
        this.stageWidth = document.body.clientWidth;
        this.stageHeight = document.body.clientHeight;

        this.canvas.width = this.stageWidth * this.pixelRatio;
        this.canvas.height = this.stageHeight * this.pixelRatio;
        this.ctx.scale(this.pixelRatio, this.pixelRatio);

        this.pixels = [];
        for (let height = 0; height < this.canvas.width; height += this.density) {
            for (let width = 0; width < this.canvas.width; width += this.density) {
                this.pixels.push({ x: width, y: height });
            }
        }

        this.visual = new Visual(this.pixels, this.ctx, setColor(this.images[0]), "curve");
    }

    animate() {
        if (this.clicked) {
            if (this.visual.animate()) {
                window.requestAnimationFrame(this.animate.bind(this));
            } else {
                this.clicked = false;
                this.onClick()
            }
        }

    }

    onClick() {
        this.clicked = !this.clicked;
        if (this.clicked) {
            this.index = this.index < this.images.length ? this.index : 0
            // this.typeNum = this.index == 0 ? Math.floor(Math.random() * this.orientation.length) : this.typeNum;
            // this.typeName = this.orientation[this.typeNum]
            this.text = this.images[this.index].src.split('/')[this.images[this.index].src.split('/').length - 1].split('.jpg')[0]
            scrambleText(this.el, this.text, 10);
            this.visual = new Visual(this.pixels, this.ctx, setColor(this.images[this.index++]), this.typeName);
            setTimeout(this.animate.bind(this), 1000)
        }

    }
}

function setColor(img: HTMLImageElement) {
    const tmpCanvas = document.createElement('canvas');
    const tmpCtx = tmpCanvas.getContext('2d');
    tmpCanvas.width = img.width;
    tmpCanvas.height = img.height;

    tmpCtx.drawImage(img, 0, 0);

    // return { colorCtx: tmpCtx, width: tmpCanvas.width, height: tmpCanvas.height }
    return tmpCtx
}

class Visual {
    private vertice: { x: number, y: number }[] = [];
    private maxVertice: number;
    private maxScale: number;
    private maxDraw: number;
    private maxGap: number;
    private stepVertice: number;
    private stepScale: number;
    private stepDraw: number;
    private stepGap: number;
    private type: number;
    private loop = 0;

    constructor(
        private pixels: { x: number, y: number }[],
        private ctx: CanvasRenderingContext2D,
        private colorCtx: CanvasRenderingContext2D,
        private orientation //: 'diagonal' | 'line' | 'tape' | 'curve' | 'triangle' | 'circle'
    ) {
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
        } else if (this.orientation === 'curve') {
            this.maxVertice = 5;
            this.maxScale = 10;
            this.maxDraw = 1;
            this.maxGap = 2048;
            this.stepVertice = -0.02;
            this.stepScale = 0;
            this.stepDraw = 2;
            this.stepGap = -768;
        } else if (this.orientation === 'triangle') {
            this.maxVertice = 3;
            this.maxScale = 10;
            this.maxDraw = 10;
            this.maxGap = 500;
            this.stepVertice = 0;
            this.stepScale = 0;
            this.stepDraw = 1;
            this.stepGap = -2;
        } else if (this.orientation === 'circle') {
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

    getRandomVertex(prev: { x: number, y: number }): { x: number, y: number } {
        if (this.orientation === 'diagonal') {
            const gab = Math.random() > 1 / 2 ?
                (Math.random() * this.maxGap / 3 + this.maxGap * 2 / 3) :
                -(Math.random() * this.maxGap / 3 + this.maxGap * 2 / 3);
            const x = prev.x + gab;
            const y = this.type ? prev.y + gab : prev.y - gab
            return { x, y }
        } else if (this.orientation === 'line') {
            const gab = Math.random() > 1 / 2 ?
                (Math.random() * this.maxGap / 3 + this.maxGap * 2 / 3) :
                -(Math.random() * this.maxGap / 3 + this.maxGap * 2 / 3);
            const x = this.type ? prev.x : prev.x + gab
            const y = this.type ? prev.y + gab : prev.y
            return { x, y }
        } else if (
            this.orientation === 'tape' ||
            this.orientation === 'curve' ||
            this.orientation === 'triangle' ||
            this.orientation === 'circle') {
            const gabX = Math.random() > 1 / 2 ?
                (Math.random() * this.maxGap + this.maxGap) :
                -(Math.random() * this.maxGap + this.maxGap);
            const gabY = Math.random() > 1 / 2 ?
                (Math.random() * this.maxGap + this.maxGap) :
                -(Math.random() * this.maxGap + this.maxGap);
            const x = prev.x + gabX;
            const y = prev.y + gabY;
            return { x, y }
        }
    }

    animate() {

        for (let loop = 0; loop < this.maxDraw; loop++) {
            const pixel = this.pixels[Math.floor(Math.random() * this.pixels.length)];
            this.vertice = [{
                x: pixel.x,
                y: pixel.y,
            }]

            for (let i = 1; i < Math.round(this.maxVertice); i++) {
                const prev = this.vertice[i - 1];
                const cur = this.getRandomVertex(prev);

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
            this.stepScale = this.maxScale > 16 ? -0.4 : -0.2
            this.maxDraw = this.maxDraw + this.stepDraw < 256 ? this.maxDraw + this.stepDraw : 255;
            this.stepDraw = this.loop < 192 ? 2 : -4;
            this.maxGap = this.maxGap + this.stepGap > 16 ? this.maxGap + this.stepGap : 16;
            this.stepGap = this.maxGap > 128 ? -16 : -4
        } else if (this.orientation === 'curve') {
            // this.maxScale = 10;
            // this.stepScale = 0;
            this.maxVertice = this.maxVertice + this.stepVertice > 2 ? this.maxVertice + this.stepVertice : 2;
            this.stepVertice = -0.2
            this.maxDraw = this.maxDraw + this.stepDraw < 256 ? this.maxDraw + this.stepDraw : 255;
            this.stepDraw = this.loop < 192 ? 2 : -4;
            this.maxGap = this.maxGap + this.stepGap > 16 ? this.maxGap + this.stepGap : 16;
            this.stepGap = this.maxGap > 128 ? -16 : -4
        } else if (this.orientation === 'triangle') {
            // this.maxVertice = 3;
            // this.maxScale = 10;
            // this.stepVertice = 0;
            // this.stepScale = 0;
            this.maxDraw = this.maxDraw + this.stepDraw < 256 ? this.maxDraw + this.stepDraw : 255;
            this.stepDraw = this.loop < 192 ? 2 : -4;
            this.maxGap = this.maxGap + this.stepGap > 16 ? this.maxGap + this.stepGap : 16;
            this.stepGap = this.maxGap > 128 ? -16 : -4
        } else if (this.orientation === 'circle') {
            // this.maxVertice = 1;
            // this.maxGap = 0;
            // this.stepVertice = 0;
            // this.stepGap = 0;
            this.maxScale = this.maxScale + this.stepScale > 8 ? this.maxScale + this.stepScale : 8;
            this.stepScale = this.maxScale > 64 ? -4 : -1
            this.maxDraw = this.maxDraw + this.stepDraw < 256 ? this.maxDraw + this.stepDraw : 255;
            this.stepDraw = this.loop < 384 ? 256 : -2;
        }
        this.loop++
        if (this.loop == 256) {
            return false;
        } else {
            return true;
        }

    }
}

class Particle {
    constructor(
        private vertice: { x: number, y: number }[],
        private ctx: CanvasRenderingContext2D,
        private colorCtx: CanvasRenderingContext2D,
        private orientation: 'diagonal' | 'line' | 'tape' | 'curve' | 'triangle' | 'circle',
        private maxScale: number,
    ) { }

    getColor(pixel: { x: number, y: number }) {
        const rgb = this.colorCtx.getImageData(pixel.x, pixel.y, 1, 1).data;
        return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
    }

    animate() {
        if (this.orientation === 'diagonal' ||
            this.orientation === 'line' ||
            this.orientation === 'tape' ||
            this.orientation === 'curve') {
            let meanX = 0;
            let meanY = 0;
            for (let vertex of this.vertice) {
                meanX += vertex.x;
                meanY += vertex.y;
            }
            meanX = Math.round(meanX / this.vertice.length)
            meanY = Math.round(meanY / this.vertice.length)
            this.ctx.beginPath();
            this.ctx.lineCap = "round"
            this.ctx.lineWidth = this.maxScale;
            this.ctx.strokeStyle = this.getColor({ x: this.vertice[0].x, y: this.vertice[0].y })
            this.ctx.moveTo(this.vertice[0].x, this.vertice[0].y)
            if (this.orientation === 'curve') {
                for (let i = 1; i < this.vertice.length; i++) {
                    const prev = this.vertice[i - 1]
                    const cur = this.vertice[i]
                    const cx = (prev.x * 1 + cur.x) / 2
                    const cy = (prev.y * 1 + cur.y) / 2
                    // this.ctx.quadraticCurveTo(prev.x, prev.y, cx, cy)
                    this.ctx.bezierCurveTo(prev.x, prev.y, cur.x, cur.y, cx, cy)
                }
            } else {
                this.ctx.lineTo(this.vertice[1].x, this.vertice[1].y)
            }
            this.ctx.stroke();
        } else if (this.orientation === 'triangle') {
            let meanX = 0;
            let meanY = 0;
            for (let vertex of this.vertice) {
                meanX += vertex.x;
                meanY += vertex.y;
            }
            meanX = Math.round(meanX / this.vertice.length)
            meanY = Math.round(meanY / this.vertice.length)
            this.ctx.beginPath();
            this.ctx.lineCap = "butt"
            this.ctx.fillStyle = this.getColor({ x: this.vertice[0].x, y: this.vertice[0].y })
            this.ctx.moveTo(this.vertice[0].x, this.vertice[0].y)
            for (let i = 1; i < this.vertice.length; i++) {
                const vertex = this.vertice[i]
                this.ctx.lineTo(vertex.x, vertex.y)
            }
            this.ctx.fill();
        } else if (this.orientation === 'circle') {
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.getColor(this.vertice[0])
            this.ctx.arc(this.vertice[0].x, this.vertice[0].y, this.maxScale, 0, Math.PI * 2)
            this.ctx.stroke();
        }
    }
}

window.onload = () => {
    new App()
}
