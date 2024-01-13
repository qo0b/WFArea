var px = 0,
	py = 0;
	
var resRatio = 0.0;
	
var areaArray = [];

var data = { chars: [] };

var dd,
	rd,
	ba,
	sa,
	pb,
	dt,
	en,
	sc;

window.onload = function() {
	setSelectors();
	placePlayer(0,0);
	loadData().then(chars => {
		data.chars = chars;
		populateDropdown();
		calcResolution();
		calcArea();
		ba.addEventListener('click', setPosition)
		dd.forEach((item) => item.addEventListener('change', calcArea))
		rd.addEventListener('change', calcResolution)
	});
}

function setSelectors() {
	dd = document.querySelectorAll(".chars");
	rd = document.querySelector("#res");
	ba = document.querySelector("#box");
	sa = document.querySelectorAll(".skill");
	scs = document.querySelectorAll(".skillContainer > div");
	sc = document.querySelectorAll(".skillContainer");
	pb = document.querySelector("#ball");
	dt = document.querySelectorAll(".detail");
	en = document.querySelector("#enemy");
}

function setPosition(event) {
	try {
		let rect = ba.getBoundingClientRect();
		placePlayer(event.clientX - rect.left,event.clientY - rect.top,rect.width,rect.height)
		moveArea();
	} catch(e) {
		return console.error(e);
	}
}

function loadData() {
	return fetch("https://raw.githubusercontent.com/blead/eliyabot-assets/master/processed/wfarea.json")
		.then(response => {
			if(!response.ok) {
				throw new Error("HTTP request error " + response.status);
			}
			return response.json();
		}).then(json => json
			.filter(char => char.DevNicknames in names)
			.map(char => ({ ENName: names[char.DevNicknames], ...char }))
			.sort((a, b) => a.ENName.localeCompare(b.ENName))
			.concat(json
				.filter(char => !(char.DevNicknames in names))
				.map(char => ({ ENName: char.DevNicknames, ...char }))
			)
		);
}

function populateDropdown() {
	try {
		dd.forEach((item) => Object.keys(data["chars"]).reduce((o,k)=>item.insertAdjacentHTML('beforeend', `<option value="${data["chars"][k].DevNicknames}">${data["chars"][k].ENName}</option>`),{}));
		Object.keys(resolutions).forEach((k) => rd.insertAdjacentHTML('beforeend', `<option value="${k}">${k} [${resolutions[k].width}x${resolutions[k].height}]</option>`))
	} catch(e) {
		return console.error(e)
	}
}

function placePlayer(x,y,xmax,ymax) {
	try {
		let left = parseInt(pb.style.left) || 0;
		let top = parseInt(pb.style.top) || 0;
		px = Math.round(x <= 0 ? 0-left : x>=(xmax) ? (xmax)-left : ((x-left)-8));
		py = Math.round(y <= 0 ? 0-top : y>=(ymax) ? (ymax)-top : ((y-top)-8));
		pb.style.left = left+px;
		pb.style.top = top+py;
	} catch(e) {
		return console.error(e);
	}
}

function calcArea() {
	let key = this.value || document.getElementById("mainSlot").firstElementChild.value;
	let charData = data["chars"].find((item) => item.DevNicknames == key).SkillRange;
	let i = 0;
	if(typeof this.id != "undefined") { 
		i=this.id=="mainSlot"?0:this.id=="subSlot"?1:2;
		sa[i].style = "";
	} else {
		i = areaArray.length;
	}
	areaArray[i] = [parseInt(charData[charData.length-8]),parseInt(charData[charData.length-7]),parseInt(charData[charData.length-6]),parseInt(charData[charData.length-5]),parseInt(charData[charData.length-4]),parseInt(charData[charData.length-3]),parseInt(charData[charData.length-2]),parseInt(charData[charData.length-1])]
	showData(i);
	let e = document.querySelectorAll(".skillContainer")[i].querySelector("#cross")
	if(e != null) {
		e.parentElement.removeChild(e)
	}
	if(!+(areaArray[i][0])) {
		if(i==0) { sa[0].style.display = "none"; return; }
		if(i==1) { sa[1].style.display = "none"; return; }
		showGlobalArea();
	} else {
		if(i==1&&!+(areaArray[0][0])) sa[0].style.display = "none";
		sa[i].style.position = "absolute";
		switch(areaArray[i][1]) {
			//Circle
			case 0:
				showCircleArea(i,areaArray[i][2],Math.abs(areaArray[i][4]),Math.abs(areaArray[i][5]))
				break;
			
			//BeamUpper
			case 1:
				showBeamUpperArea(i,areaArray[i][2]/2,areaArray[i][3]/2,areaArray[i][4],areaArray[i][5],areaArray[i][6],areaArray[i][7])
				break;
				
			//BeamMiddle
			case 2:
				showBeamMiddleArea(i,areaArray[i][2]/2,areaArray[i][3]/2,areaArray[i][4],areaArray[i][5],areaArray[i][6],areaArray[i][7])
				break;
			
			//Cross
			case 3:
				showCrossArea(i,areaArray[i][2]/2,areaArray[i][3]/2,areaArray[i][4],areaArray[i][5],areaArray[i][6],areaArray[i][7])
				break;
				
			//Section
			case 4:
				showSectionArea(i,areaArray[i][2],areaArray[i][3],Math.abs(areaArray[i][4]),Math.abs(areaArray[i][5]))
				break;
				
			//Catch
			default:
				break;
		}
	}
}

function showData(id) {
	const types = {"0": "Circle", "1": "BeamUpper", "2": "BeamMiddle", "3": "Cross", "4": "Section"}
	const p1Val = {"0": "Radius", "1": "Width", "2": "Width", "3": "Width", "4": "Radius"}
	const p2Val = {"1": "Height", "2": "Height", "3": "Height", "4": "Central Angle*0.0174.."}
	const dict  = {"0": `<b>Is Area:</b> ${!!(areaArray[id][0])}`, "1": `<b>Type:</b> ${types[areaArray[id][1]]}`, "2": `<b>${p1Val[areaArray[id][1]]}:</b> ${areaArray[id][2]}`, "3": `<b>${p2Val[areaArray[id][1]]}:</b> ${areaArray[id][3]}`, "4": `<b>X-Offset:</b> ${areaArray[id][4]}`, "5": `<b>Y-Offset:</b> ${areaArray[id][5]}`, "6": `<b>Direction Kind:</b> ${areaArray[id][6]}`, "7": `<b>Direction Degrees:</b> ${areaArray[id][7]}`}
	
	if(dt[id].firstElementChild != null) {
		dt[id].innerHTML = ""
	}
	
	for(let i=0;i<areaArray[id].length;i++) {
		if(isNaN(areaArray[id][i])) continue;
		dt[id].insertAdjacentHTML('beforeend', `<div class="detail${i}">${dict[i]}</div>`);
	}
}

function calcResolution() {
	let key = this.value;
	if(typeof key == "undefined") key = rd.firstElementChild.value;
	
	ba.style.width  = (resolutions[key].lwidth)  + "px";
	ba.style.height = (resolutions[key].lheight) + "px";
	
	resRatio = test(resolutions[key].width,resolutions[key].height).scale
	calcArea()
}

function moveArea() {
	if(!+(areaArray[0][0])&&!+(areaArray[1][0])) return;
	setSelectors()
	
	let i=0;
	scs.forEach(function(item) {
		i = item.parentElement.id=="mainSkill"?0:1
		let left = parseInt(item.style.left) || 0
		let top = parseInt(item.style.top) || 0
		item.style.left = left+px
		item.style.top = top+py
		switch(areaArray[i][6]) {
			case 1:
				break;
			case 2:
				const pbcr = pb.getBoundingClientRect()
				const encr = en.getBoundingClientRect()
				const a = parseInt(pbcr.left)-(parseInt(encr.left)+(parseInt(en.width)/2))
				const b = parseInt(pbcr.top)-(parseInt(encr.top)+(parseInt(en.height)/2))
				let m = 0;
				if(a >= 0 && b >= 0) {m=360}
				else if(b < 0) {m=180}
				const d = m-(180/Math.PI*Math.atan(a/b))
				item.style.transform = "rotate("+d+"deg)"
				break;
		}
	})
}

function clean(item) {
	item.querySelector(".skill").style = "";
}

function showGlobalArea() {
	sa[0].style.top = 0;
	sa[0].style.left = 0;
	sa[0].style.borderBottomRightRadius = "50%";
	sa[0].style.borderBottomLeftRadius = "50%";
}

function showCircleArea(id,radius,xoffset,yoffset) {
	clean(sc[id])
	sc[id].querySelector(".skill").style.width = (radius*resRatio) + "px";
	sc[id].querySelector(".skill").style.height = (radius*resRatio) + "px";
	sc[id].querySelector(".skill").style.borderRadius = "50%";
	yoffset = yoffset*resRatio/2
	xoffset = xoffset*resRatio/2
	sc[id].querySelector(".skill").style.left = parseInt(pb.style.left)+8 - ((radius/2)*resRatio);
	sc[id].querySelector(".skill").style.top = parseInt(pb.style.top)+8 - ((radius/2)*resRatio);
	sc[id].querySelector(".skill").style.top = parseInt(sc[id].querySelector(".skill").style.top) - yoffset
}

function showBeamUpperArea(id,width,height,xoffset,yoffset,kind,degrees) {
	clean(sc[id])
	sc[id].querySelector(".skill").style.width = (width*resRatio) + "px";
	sc[id].querySelector(".skill").style.height = (height*resRatio) + "px";
	let a = parseInt(pb.getBoundingClientRect().left)-(parseInt(en.getBoundingClientRect().left)+(parseInt(en.width)/2)) //a
	let b = parseInt(pb.getBoundingClientRect().top)-(parseInt(en.getBoundingClientRect().top)+(parseInt(en.height)/2)) //b
	switch(kind) {
		case 1:
			break;
		case 2:
			sc[id].querySelector(".skill").style.transformOrigin = "center bottom"
			let m = 0;
			if(a >= 0 && b >= 0) {m=360}
			else if(b < 0) {m=180}
			const d = m-(180/Math.PI*Math.atan(a/b))
			sc[id].querySelector(".skill").style.transform = "rotate("+d+"deg)"
			break;
	}
	sc[id].querySelector(".skill").style.left = (((parseInt(pb.style.left)+8) - ((width/2)*resRatio)) + (xoffset*resRatio));
	sc[id].querySelector(".skill").style.top = (((parseInt(pb.style.top)+8) - (height*resRatio)) + (yoffset*resRatio));
}

function showBeamMiddleArea(id,width,height,xoffset,yoffset,kind,degrees) {
	clean(sc[id])
	sc[id].querySelector(".skill").style.width = (width*resRatio) + "px";
	sc[id].querySelector(".skill").style.height = (height*resRatio) + "px";
	sc[id].querySelector(".skill").style.left = (((parseInt(pb.style.left)+8) - ((width/2)*resRatio)) + (xoffset*resRatio));
	sc[id].querySelector(".skill").style.top = (((parseInt(pb.style.top)+8) - ((height/2)*resRatio)) + (yoffset*resRatio));
}

function showCrossArea(id,width,height,xoffset,yoffset,kind,degrees) {
	clean(sc[id])
	sc[id].querySelector(".skill").insertAdjacentHTML('afterend', `<div id="cross"></div>`);
	sc[id].querySelector(".skill").style.width = (width*resRatio) + "px";
	sc[id].querySelector(".skill").style.height = (height*resRatio) + "px";
	sc[id].querySelector(".skill").style.transform = "rotate("+degrees+"deg)"
	sc[id].querySelector(".skill").style.left = (parseInt(pb.style.left)+8) - ((width/2)*resRatio) + (xoffset*resRatio);
	sc[id].querySelector(".skill").style.top = (parseInt(pb.style.top)+8) - ((height/2)*resRatio) + (yoffset*resRatio);
	let X = sc[id].querySelector("#cross");
	for(prop in sc[id].querySelector(".skill").style) {
		X.style[prop] = sc[id].querySelector(".skill").style[prop]
	}
	X.style.transform = "rotate("+(270+degrees)+"deg)"
	X.style.backgroundColor = getComputedStyle(sc[id].querySelector(".skill")).backgroundColor;
}

function showSectionArea(id,radius,angle,xoffset,yoffset) {
	let color = id == 0 ? "#92eb34" : "#ffeb3b";
	let deg = parseInt(angle);
	showCircleArea(id,radius,xoffset,yoffset);
	sc[id].querySelector(".skill").style.backgroundColor = "transparent";
	sc[id].querySelector(".skill").style.backgroundImage = `conic-gradient(from ${-deg/2}deg, ${color} ${deg}deg, transparent 0deg)`;
}

function test(width,height) {
	var orientationX = NaN;
	var orientationY = NaN;
	var screenScale = NaN;
	var temp = 0;
	var topMarginSafeArea = NaN;
	var fullSizeNormalize = NaN;
	var fullScreenWidth = parseInt(width)
	var fullScreenHeight = parseInt(height)
	if(fullScreenWidth > fullScreenHeight)
	{
		temp = fullScreenHeight;
		fullScreenHeight = fullScreenWidth;
		fullScreenWidth = temp;
	}
	var widthHeightRatio = fullScreenWidth / fullScreenHeight;
	if(widthHeightRatio < 0.5625)
	{
		topMarginSafeArea = fullScreenWidth / 0.5625;
		orientationX = 0;
		orientationY = (fullScreenHeight - topMarginSafeArea) / 2;
		screenScale = topMarginSafeArea / 1920;
	}
	else
	{
		if(0.75 < widthHeightRatio)
		{
		orientationX = (fullScreenHeight * 0.75 - fullScreenHeight * 0.5625) / 2;
		}
		else
		{
		orientationX = (fullScreenWidth - fullScreenHeight * 0.5625) / 2;
		}
		orientationY = 0;
		screenScale = fullScreenHeight / 1920;
	}
	var isScreenNormal = fullScreenWidth <= 755 && fullScreenWidth >= 745 && fullScreenHeight <= 1339 && fullScreenHeight >= 1329;
	if(isScreenNormal)
	{
		orientationX += (fullScreenWidth - (Number(719.928 + orientationX * 2))) / 2;
		orientationY += (fullScreenHeight - (Number(1279.8719999999998 + orientationY * 2))) / 2;
		screenScale = 0.6666;
	}
	topMarginSafeArea = 0;
	var bottomMarginSafeArea = 0;
	if(widthHeightRatio < 0.49)
	{
		topMarginSafeArea = 115;
		bottomMarginSafeArea = 89;
	}
	var fullSize = fullScreenHeight / screenScale;
	if(fullSize > 2339)
	{
		fullSizeNormalize = (fullSize - 2339) * 0.5;
		topMarginSafeArea += _loc12_;
		bottomMarginSafeArea += _loc12_;
	}
	var showStatusBar = widthHeightRatio < 0.49;
	return {
		"orientX":orientationX,
		"orientY":orientationY,
		"screenWidth":fullScreenWidth,
		"screenHeight":fullScreenHeight,
		"scale":screenScale,
		"safeAreaTopMargin":topMarginSafeArea,
		"safeAreaBottomMargin":bottomMarginSafeArea,
		"canShowPlatformStatusBar":showStatusBar
	};
}
