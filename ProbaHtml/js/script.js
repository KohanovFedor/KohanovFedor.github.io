var canvas, ctx, num = 0;
var box = [];
var line = [];
var lineClr = [];
var oldLineClr = [];
var dragok = false;
var startX;
var startY;
var offsetX = 10;
var offsetY = 10;
var inClr = ["Khaki", "Salmon", "Limegreen","Dodgerblue"];
var outClr = ["Gold", "Red","Green","Darkblue"];

var fontSize = 12;

var countLineClr=0;

var tmpLineForCloseForm = [];

var TypeIzol = ["Мин.вата","ППУ","ППС","ВПЭ"];
var TypePipes = ["Надземная","Подземная" ,"Подвальная"];
//основная функция программы
function main(){
        canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");
        canvas.width = 500;
        canvas.height = 500;
        canvas.style.background = "#444444";
        document.body.appendChild(canvas);


		var pEl = document.createElement('p');
		pEl.id = "message";
		pEl.innerHTML = "На данном холсте схематично изображены дома(теплопотребители) и трубопровод(участки сети). <br> \
		Трубопровод можно перемещать. Для этого кликните на трубопровод и с зажатой левой кнопкой мыши, передвигайте курсор.<br> \
		Трубопровод окрашен в разные цвета в зависимости от вида изоляции. Внутри зданий трубопровод окрашен в менее яркий цвет, что означает, что трубопровод проходит внутри здания. <br> \
		Надписи над трубопроводом появляются, если позволяет место. Я не смог добиться смены надписи, при смене вида изоляции из всплывающей формы. <br> \
		Так же, я не смог добиться смены цвета участка трубопровода, при смене вида изоляции. Точнее сказать, могу реализовать, но до момента перемещения трубопровода. <br> \
		Для того, чтобы вызвать всплывающее окно, неоходимо двойным кликом нажать на участок трубопровода.<br> \
		Внутри зданий тип прокладки трубопровода может быть только подвальная, снаружи надземная или подземная.";
		
		document.body.appendChild(pEl);

        generationRndBox();
		getLine();
        draw();
		findPointsLineClr();
		
        canvas.onmousedown = myDown;
        canvas.onmouseup = myUp;
        canvas.onmousemove = myMove;
        canvas.oncontextmenu = function () { return false; };
        canvas.ondblclick = myOnDbClick;
		document.body.onmousedown =  (function (e) {
			var elem = document.getElementById("myForm");
			var mx = parseInt(e.clientX - offsetX);
			var my = parseInt(e.clientY - offsetY);
			var el = elem.getBoundingClientRect()
			if(!(el.left<mx && (el.left+el.width)>mx && el.top<my && (el.top+el.height)>my) && (elem.style.display=="block"))
				closeForm();
		});
}

//обработка событий
function myOnDbClick(e){
    var mx = parseInt(e.clientX - offsetX);
    var my = parseInt(e.clientY - offsetY);
	if(IntersLineBool(mx,my))
		openForm(mx,my);
	else
		return;
}
function myMove(e){
         
        countLineClr=0;
		if (dragok) {
            var mx = parseInt(e.clientX - offsetX);
            var my = parseInt(e.clientY - offsetY);
 
            var dx = mx - startX;
            var dy = my - startY;
 
            for (var i = 0; i < line.length; i++) {
                if (line[i].isDragging == true) {
                    if(line[i].vert==true)
                    {
                        line[i].x1 += dx;
                        line[i].x2 += dx;
						if(i!=line.length-1)
							line[i+1].x1=line[i].x2;
						if(i!=0)
							line[i-1].x2=line[i].x1;
						
                    }
                    else
                    {    
                        line[i].y1 += dy;
                        line[i].y2 += dy;
						if(i!=line.length-1)
							line[i+1].y1=line[i].y2;
						if(i!=0)
							line[i-1].y2=line[i].y1;
						
                    } 
                }
            }
			
			findPointsLineClr();
            startX = mx;
            startY = my;
        }
    }
function myUp(e){
        dragok = false;
        for (var i = 0; i < line.length; i++) {
            line[i].isDragging = false;
        }
		
		
    }
function myDown(e){
        if(e.which==1)
        {
            var mx = parseInt(e.clientX - offsetX);
            var my = parseInt(e.clientY - offsetY);
     
            dragok = true;
            var group = [];
            for (var i = 0; i < line.length; i++) {
				if(line[i].vert==true)
				{
					if(line[i].y1<line[i].y2)
					{
						if (mx > line[i].x1-5 && mx < line[i].x2+5&& my > line[i].y1-5 && my < line[i].y2 + 5) 
						{
                            group.push(line[i]);
                            continue;
						}
					}
					else
					{
						if (mx > line[i].x1-5 && mx < line[i].x2+5&& my < line[i].y1+5 && my > line[i].y2 - 5) 
						{
                            group.push(line[i]);
                            continue;
						}
					}
				}
				else
				{
					if(line[i].x1<line[i].x2)
					{	
						if (mx > line[i].x1-5 && mx < line[i].x2+5 && my > line[i].y1-5 && my < line[i].y2 + 5) 
						{
                            group.push(line[i]);
                            continue;
						}
					}
					else
					{
						if (mx < line[i].x1+5 && mx > line[i].x2-5 && my < line[i].y1+5 && my > line[i].y2 - 5) 
						{
                            group.push(line[i]);
                            continue;
						}
					}
				}
            }
                
            for (var i=0;i<group.length;i++)
            {
                group[i].isDragging = true;
            }

            startX = mx;
            startY = my;
        }
    
	
	}
 
function openForm(mx,my){
    var el = document.getElementById("myForm");
	el.style.cssText = 'display: block; top: ' + my +'px; left: '+mx+'px;';
	
	tmpLineForCloseForm.push(IntersLine(mx,my));
	
	var inpYear = document.getElementById("year");
	inpYear.value = tmpLineForCloseForm[0].year;
	
	var selectTypeIzol = document.getElementById("selectTypeIzol");
	while (selectTypeIzol.firstChild) {
    selectTypeIzol.removeChild(selectTypeIzol.firstChild);
	}
	
	for(var i=0;i<TypeIzol.length;i++){
		selElem = document.createElement("option");
		selElem.text = TypeIzol[i];
		if(TypeIzol[i]==tmpLineForCloseForm[0].typeIzol)
			selElem.selected=true;
		selectTypeIzol.appendChild(selElem);
	}
	
	var selectTypePipes = document.getElementById("selectTypePipes");
	while (selectTypePipes.firstChild) {
    selectTypePipes.removeChild(selectTypePipes.firstChild);
	}
	if(tmpLineForCloseForm[0].inOut=="out")
	{
		for(var i=0;i<TypePipes.length-1;i++){
			selElem = document.createElement("option");
			selElem.text = TypePipes[i];
			if(TypePipes[i]==tmpLineForCloseForm[0].typePipe)
				selElem.selected=true;
			selectTypePipes.appendChild(selElem);
		}
	}
	else
	{
		selElem = document.createElement("option");
		selElem.text = TypePipes[2];
		selElem.selected=true;
		selectTypePipes.appendChild(selElem);
	}
}
function closeForm(){
    var elem = document.getElementById("myForm");
	elem.style.display = "none";
	
	var n = document.getElementById("selectTypeIzol").options.selectedIndex;
	var l = lineClr[tmpLineForCloseForm[0].num-1];
	l.year = document.getElementById("year").value;
	var n = document.getElementById("selectTypeIzol").options.selectedIndex;
	l.typeIzol = document.getElementById("selectTypeIzol").options[n].text;
	n = document.getElementById("selectTypePipes").options.selectedIndex;
	l.typePipe = document.getElementById("selectTypePipes").options[n].text;
	
	tmpLineForCloseForm = [];
	
}
// конец обработки событий	

//функции отрисовки
function rectDraw(r){
        ctx.strokeStyle = r.fill;
		ctx.lineWidth = 2;
        ctx.strokeRect(r.x, r.y, r.width, r.height);
    }
function lineDraw(l){
    ctx.beginPath();
    ctx.moveTo(l.x1, l.y1);
    ctx.lineTo(l.x2, l.y2);
    ctx.strokeStyle = 'rgba(255,227,71,0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
}
function labelLineV(l){
    var lenMid = Math.abs(l.y1 - l.y2) / 2;
    var lenNameMid = l.typeIzol.length * fontSize / 4;
    var xName = l.x1 + 2;
    var yName = (l.y1 > l.y2) ? (l.y2 + (lenMid - lenNameMid)) : (l.y1 + (lenMid - lenNameMid));
    ctx.save();
    ctx.translate(xName, yName);
    ctx.rotate(inRad(90));
    ctx.font = fontSize + "px";
    ctx.fillStyle = l.clr;
    ctx.fillText(l.num+" "+l.typeIzol, 0, 0);
    ctx.restore();
}
function labelLineH(l){
    var lenMid = Math.abs(l.x1 - l.x2) / 2;
    var lenNameMid = l.typeIzol.length * fontSize / 4;
    var xName = (l.x1 > l.x2) ? (l.x2 + (lenMid - lenNameMid)) : (l.x1 + (lenMid - lenNameMid));
    var yName = l.y1 - 2;
    ctx.save();
    ctx.translate(xName, yName);
    //ctx.rotate(inRad(90));
    ctx.font = fontSize + "px";
    ctx.fillStyle = l.clr;
    ctx.fillText(l.num+" "+l.typeIzol, 0, 0);
    ctx.restore();
}
function lineClrDraw(l, i){
        //str +=i+": "+Math.round(l.x1) + "," + Math.round(l.y1) + ";" + Math.round(l.x2) + "," + Math.round(l.y2) + "=" + l.clr + "\n";
        ctx.beginPath();
        ctx.strokeStyle = l.clr;
        ctx.lineWidth = 2;
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
    if (l.vert == true) {
        if (Math.abs(l.y1 - l.y2) > (l.typeIzol.length * fontSize))
            labelLineV(l);
    }
    else {
        if (Math.abs(l.x1 - l.x2) > (l.typeIzol.length * fontSize))
            labelLineH(l);
    }   
}
function draw(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < box.length; i++) {
            rectDraw(box[i]);
        }

        for(var i=0; i<line.length;i++)
        {
            lineDraw(line[i]);
            
        }
		
		for(var i=0;i<lineClr.length;i++)
		{
            lineClrDraw(lineClr[i], i);
        }   
    }
//конец функций отрисовки

//функции генерации объектов
function generationRndBox(){
	var countBox = getRandomArbitary(2,10);
		
		for (var i=0;i<countBox;i++)
		{
			var tmpBoxA={
				x : getRandomArbitary(0,500),
				y : getRandomArbitary(0,500),
				width: getRandomArbitary(50,250),
				height: getRandomArbitary(50,250)
			};
			while(AreIntersected(tmpBoxA))
			{
				tmpBoxA={
					x : getRandomArbitary(0,500),
					y : getRandomArbitary(0,500),
					width: getRandomArbitary(50,250),
					height: getRandomArbitary(50,250)
				};
			}
			
			box.push({
					x: tmpBoxA.x,
					y: tmpBoxA.y,
					z:0,
					width: tmpBoxA.width,
					height: tmpBoxA.height,
					fill: "darkgray",
					isDragging: false,
				});
		}

}
function getLine(){
            var x1, y1,x2,y2;
            var clr = "#FFE347";
            countLines = getRandomArbitary(2,10);
			var oldVert = false;
			x1 = getRandomArbitary(0,50);
            y1 = getRandomArbitary(0,50);
            x2 = getRandomArbitary(50,300);
            y2 = y1;
            pushLine(0,x1,y1,x2,y2,clr, oldVert);
			for(var i=1;i<countLines;i++)
			{
				if(oldVert==false)
				{
					x1 = x2;
					y1 = y2;
					x2 = x1;
					y2 = getRandomArbitary(50,500);
					oldVert=true;
				}
				else
				{
					x1 = x2;
					y1 = y2;
					x2 = getRandomArbitary(50,500);
					y2 = y1;
					oldVert=false;
				}
				pushLine(i,x1,y1,x2,y2,clr, oldVert);
			}
            
    }
function pushLine(num, x1,y1,x2,y2, clr, vert){ //clr - цвет линии, vert - вертикальная линия или нет. 
        line.push(
            {
                num: num,
				year: Math.round(getRandomArbitary(1980,2018)),
				x1: x1,
                y1: y1,
                x2: x2,
                y2: y2,
                clr: clr,
                vert: vert,
				typeIzol: TypeIzol[Math.round(getRandomArbitary(0,3))],
				typePipe: TypePipes[Math.round(getRandomArbitary(0,1))],
                isDragging: false
            });
    }
function createColorLine(lineOne, ps){
        var indClr = TypeIzol.indexOf(lineOne.typeIzol);
		var oldClr;
		var tmpInOut;
		var tmpTypePipe;
		if(IntersectionRect(lineOne.x1,lineOne.y1)==true)
		{
			oldClr = inClr[indClr];
			tmpTypePipe = TypePipes[3];
			tmpInOut = "in";
		}
		else
		{
			oldClr = outClr[indClr];
			tmpTypePipe = lineOne.typePipe;
			tmpInOut = "out";
		}
		
		
		var oldX = lineOne.x1;
		var oldY = lineOne.y1;
		for(var i=0;i<=ps.length;i++)
		{
            countLineClr++;
            if (i != ps.length)
			{	
				lineClr.push(
				{
					mainLine: lineOne.num,
					num: countLineClr,
					year: lineOne.year,
					x1: oldX,
					y1: oldY,
					x2: ps[i].x,
					y2: ps[i].y,
                    clr: oldClr,
                    vert: lineOne.vert,
					typeIzol: lineOne.typeIzol,
					typePipe: tmpTypePipe,
					inOut: tmpInOut,
				});
				oldX = ps[i].x;
				oldY = ps[i].y;
				if(tmpInOut=="in")
				{
					oldClr=outClr[indClr];
					tmpTypePipe = lineOne.typePipe;
					tmpInOut = "out";
				}
				else
				{
					oldClr=inClr[indClr];
					tmpTypePipe = TypePipes[3];
					tmpInOut = "in";
				}
			}
			else
			{
				lineClr.push(
				{
					mainLine: lineOne.num,
					num: countLineClr,
					year: lineOne.year,
					x1: oldX,
					y1: oldY,
					x2: lineOne.x2,
					y2: lineOne.y2,
                    clr: oldClr,
                    vert: lineOne.vert,
					typeIzol: lineOne.typeIzol,
					typePipe: tmpTypePipe,
					inOut: tmpInOut,
				});
			}
        }
        
	}
function findPointsLineClr(){
	lineClr=[];
			var ps = [];
			for(var i=0;i<line.length;i++)
			{
				ps=[];
				for(var j=0;j<box.length;j++)
				{
					var p;
					if(line[i].vert==false)
					{	
						p = Intersection(line[i].x1,line[i].y1,line[i].x2,line[i].y2,box[j].x,box[j].y,box[j].x,box[j].y+box[j].height);
						if(p.x!=-1 && p.y!=-1)
						{	
							ps.push(p);
						}
						p = Intersection(line[i].x1,line[i].y1,line[i].x2,line[i].y2,box[j].x+box[j].width,box[j].y,box[j].x+box[j].width,box[j].y+box[j].height);
						if(p.x!=-1 && p.y!=-1)
						{					
							ps.push(p);	
						}
					}
					else
					{
						p = Intersection(line[i].x1,line[i].y1,line[i].x2,line[i].y2,box[j].x,box[j].y,box[j].x+box[j].width,box[j].y);
						if(p.x!=-1 && p.y!=-1)
						{	
							ps.push(p);
						}
						p = Intersection(line[i].x1,line[i].y1,line[i].x2,line[i].y2,box[j].x,box[j].y+box[j].height,box[j].x+box[j].width,box[j].y+box[j].height);
						if(p.x!=-1 && p.y!=-1)
						{					
							ps.push(p);	
						}
					}
				}
                
                if (line[i].vert == false)
				{
                    if (line[i].x1 > line[i].x2)
                        ps.sort(function (a, b) { return b.x - a.x; });
                    else
                        ps.sort(function (a, b) { return a.x - b.x; });
				}
				else
				{
					if(line[i].y1>line[i].y2)
                        ps.sort(function (a, b) { return b.y - a.y; });
                    else
                        ps.sort(function (a, b) { return a.y - b.y; });
				}

                createColorLine(line[i], ps);
 				
 			}

            draw();
}
//конец функций генерации объектов

//вспомогательные функции	
function IntersLine(mx,my){
	for (var i = 0; i < lineClr.length; i++) {
				if(lineClr[i].vert==true)
				{
					if(lineClr[i].y1<lineClr[i].y2)
					{
						if (mx > lineClr[i].x1-5 && mx < lineClr[i].x2+5&& my > lineClr[i].y1-5 && my < lineClr[i].y2 + 5) 
						{
                            return lineClr[i];
						}
					}
					else
					{
						if (mx > lineClr[i].x1-5 && mx < lineClr[i].x2+5&& my < lineClr[i].y1+5 && my > lineClr[i].y2 - 5) 
						{
                            return lineClr[i];
						}
					}
				}
				else
				{
					if(lineClr[i].x1<lineClr[i].x2)
					{	
						if (mx > lineClr[i].x1-5 && mx < lineClr[i].x2+5 && my > lineClr[i].y1-5 && my < lineClr[i].y2 + 5) 
						{
                            return lineClr[i];
						}
					}
					else
					{
						if (mx < lineClr[i].x1+5 && mx > lineClr[i].x2-5 && my < lineClr[i].y1+5 && my > lineClr[i].y2 - 5) 
						{
                            return lineClr[i];
						}
					}
				}
            }
}
function IntersLineBool(mx,my){
	for (var i = 0; i < lineClr.length; i++) {
				if(lineClr[i].vert==true)
				{
					if(lineClr[i].y1<lineClr[i].y2)
					{
						if (mx > lineClr[i].x1-5 && mx < lineClr[i].x2+5&& my > lineClr[i].y1-5 && my < lineClr[i].y2 + 5) 
						{
                            return true;
						}
					}
					else
					{
						if (mx > lineClr[i].x1-5 && mx < lineClr[i].x2+5&& my < lineClr[i].y1+5 && my > lineClr[i].y2 - 5) 
						{
                            return true;
						}
					}
				}
				else
				{
					if(lineClr[i].x1<lineClr[i].x2)
					{	
						if (mx > lineClr[i].x1-5 && mx < lineClr[i].x2+5 && my > lineClr[i].y1-5 && my < lineClr[i].y2 + 5) 
						{
                            return true;
						}
					}
					else
					{
						if (mx < lineClr[i].x1+5 && mx > lineClr[i].x2-5 && my < lineClr[i].y1+5 && my > lineClr[i].y2 - 5) 
						{
                            return true;
						}
					}
				}
            }
			return false;
}
function AreIntersected(rect){
		for(var i=0;i<box.length;i++)
		{
			if(!((rect.x+rect.width <= box[i].x) || (rect.x >= box[i].x+box[i].width) || (rect.y+rect.height <= box[i].y) || (rect.y >= box[i].y+box[i].height)))
				return true;
		}
		return false;
	}
function Point(x, y){
		this.x = x;
		this.y = y;
	}
function Intersection(ax1,ay1,ax2,ay2,bx1,by1,bx2,by2){		
		var	d = (ax1-ax2) * (by2-by1) - (ay1-ay2) * (bx2-bx1);
		var da = (ax1-bx1) * (by2-by1) - (ay1-by1) * (bx2-bx1);
		var db = (ax1-ax2) * (ay1-by1) - (ay1-ay2) * (ax1-bx1);
		
		var ta = da / d;
		var tb = db / d;
		
		if (ta >= 0 && ta <= 1 && tb >= 0 && tb <= 1){

		var xf1= ax1 + ta * (ax2-ax1);
		var yf1= ay1 + ta * (ay2-ay1);

	    xf1=Math.round(xf1);
	    yf1=Math.round(yf1);
		
		return new Point(Math.round(xf1),Math.round(yf1));
		
		} 	
		else {return new Point(-1,-1);}			
	}  
function getRandomArbitary(min, max){
      return Math.random() * (max - min) + min;
    }
function IntersectionRect(x,y){
		
		for(var i=0;i<box.length;i++)
		{
			if(box[i].x<x && (box[i].x+box[i].width)>x && box[i].y<y && (box[i].y+box[i].height)>y)
				return true;
		}
		return false;
	}
function inRad(num){
    return num * Math.PI / 180;
}
// конец вспомогательных функций
main();