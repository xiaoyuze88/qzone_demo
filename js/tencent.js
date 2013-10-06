(function(window){

var reg = /^(?:#([\w-]+))|(?:\.([\w-]+))|([\s\S]+)/;


var tencent = {
	callback_list : [],
	onReady : function (callback) {
		var that = this;
	// if dom is already complete, call it directly
		if(document.readyState == 'complete')
		{
			callback();
			return;
		}
	// add to callback list
		this.callback_list.push(callback);

		document.onreadystatechange = fn;
		function fn() {
			if(document.readyState == 'complete') 
			{
				for(var i = 0,len = that.callback_list.length; i < len; i++)
				{
					if(typeof that.callback_list[i] == 'function') that.callback_list[i]();
					else continue;
				}
				// clear callback_list
				that.callback_list.length = 0;
			}
		}
	},	
// all code inside the callback will be called right after the dom is ready
	on : function (o,event,handler) {
		if(this.check(o) === 'array' && o.length > 0)
		{
			var that = this;
			o.forEach(function(x) {
				that.on(x,event,handler);
			});
		}
		else
		{
			try {
				if (window.addEventListener)
				{					
					o.addEventListener(event, handler, false);
				}
				else
				{
					o.attachEvent('on' + event, function(e) {
			// set 'this' to the current dom object, rather than window;
						e = e || window.event;
						return handler.call(o,e);
					});
				}
			}catch(e){}
		}
		
	},
	preventDefault : function (e) {
		e = e || window.event;
		if(e.preventDefault) e.preventDefault();
		else e.returnValue = false;
	},
	stopPropagation : function (e) {
		e = e || window.event;
		if(e.stopPropagation) e.stopPropagation();
		else e.cancelBubble = true;
	},
	// can't input array
	mouseEnterLeave : function (o,enterCallback,leaveCallback) {
		var that = this;
		this.on(o,'mouseover',function(e)
		{
			if(that.checkMouseoverFrom(this,e))
			{
				enterCallback.call(o,e);
			}
		});
		this.on(o,'mouseout',function(e)
		{
			if(that.checkMouseoutTo(this,e))
			{
				leaveCallback.call(o,e);
			}
		});
	},
//selector : accept String , like #id,.className,tagName and HTMLNode, return DomElement array
	find : function (selector,node) {

		if(typeof selector !== 'string') return null;

		var match = reg.exec(selector),
			_cache,
			re = null;

		node = (node && node.nodeType === 1) ?
				node : document;

		if(match)
		{
		// id selector
			if(match[1])
			{
				re = document.getElementById(match[1]);
			}
		// class selector
			else if(match[2])
			{
				if(typeof document.getElementsByClassName === 'function')
				{
					if(_cache = node.getElementsByClassName(match[2]))
					{
						re = makeArray(_cache);
					}
				}
		// for ie 6
				else
				{
					re = getElementsByClassName(match[2],node);
				}
			}
		// tag selector
			else if(match[3])
			{
				// alert(match[3])
				if(_cache = node.getElementsByTagName(match[3]))
				{
					re = makeArray(_cache);
				}
			}
		}
		return re;
	},
	// try to remove an element
	remove : function(o) {
		try {
			o.parentNode.removeChild(o)
		}catch(e) {}
	},
	each : function (array,fn) {
		if(check(array) !== 'array') return false;
		
		if(typeof fn === 'function')
			array.forEach(fn);
	},
	check : function(o) {
		try {
			return Object.prototype.toString.call(o).replace(/^(\[\w+\s)|(\])$/g,'').toLowerCase();
		}catch(e) {
			return false;
		}
	},
	// iterator the node
	iterator : function (node,func) {
		func(node);
		node = node.firstChild;
		while(node) 
		{
			this.iterator(node,func);
			node = node.nextSibling;
		}
	},
	// find the node's parentNode , selector is like ".className","#id","tagname".
	parent : function(node,selector) {
		var parent = node.parentNode;
		var match = reg.exec(selector);
		var fn = match && (
			match[1] ? filter['id'] :
			match[2] ? filter['class'] : 
			match[3] ? filter['tag'] :
			null);

		var selectorName = match[1] || match[2] || match[3];

		if(typeof fn !== 'function') throw new TypeError(fn + ' is not a function');

		while(parent && !fn(parent,selectorName))
		{
			parent = parent.parentNode;
		}
		return parent;
	},
	// check whether the src element is the child of that
	// return true if the src element is the child of that,else return false
	checkMouseoutTo : function (that,e) {
		e = e || window.event;

		var parent = e.relatedTarget || e.toElement || null;
		try {
			while ( parent && parent !== that ) {
				parent = parent.parentNode;
			}
			return (parent !== that);
		} catch(e) { }
	},
	checkMouseoverFrom : function (that,e){
		e = e || window.event;
		var parent = e.relatedTarget || e.fromElement || null;
		try {
			while ( parent && parent !== that ) {
				parent = parent.parentNode;
			}
			return (parent !== that);
		} catch(e) { }
	},
	// total: how long should the animation take; frames: how many frames should the animation show;
	// callback: every frame the callback can get an param p, from 0 to 1 ,means the rate of progress,
	// the animate function return a function stop: which can stop the animation
	animate : function (total,frames,callback,completeCallback) {
		var timer,
			gap = total/frames,
			current = 0;

		function nextFrame()
		{
			var p = current/total;
			if (p >= 1)
			{
				callback(1);
				if(typeof completeCallback === 'function') completeCallback();
			}
			else
			{
				callback(p);
				current+=gap;
				timer = setTimeout(nextFrame,gap);
			}
		}
		nextFrame();
		return { stop: function()
		{
			try {
				clearTimeout(timer);
			} catch(e) {}
		}};
	},
	checkUserAgent : function() {
		if(!navigator) return false;
		var bro,str;
		var useragent = navigator.userAgent.toLowerCase();
		(str = useragent.match(/msie\s([\d\.]+)/))    ? bro = 'IE ' + str[1] :
		(str = useragent.match(/firefox\/([\d\.]+)/)) ? bro = 'FIREFOX ' + str[1] :
		(str = useragent.match(/chrome\/([\d\.]+)/))  ? bro = 'CHROME ' + str[1] :
		(str = useragent.match(/opera.([\d.]+)/))     ? bro = 'OPERA ' + str[1] :
		(str = useragent.match(/version[\s\S]*safari\/([\d\.]+)/)) ? bro = 'SAFARI ' + str[1] : false;
		return bro;
	}
}

var filter = {
	'id' : function(node,id) {
		return node.id == id;
	},
	'class' : function(node,className) {
		return isMatchClass(node,className);
	},
	'tag' : function(node,tagName) {
		return isMatchTag(node,tagName);
	}
}

function makeArray(arr) {
	var re = [];
	try {
		re = Array.prototype.slice.call(arr)	
	}catch(e) {
		// for ie
		for(var i = 0, l = arr.length; i < l; i++)
		{
			re.push(arr[i]);
		}
	}
	return re;
}

function getElementsByClassName (className,node) {
	var matchs = [];
	node = node || document.body;
	// alert(node)
	tencent.iterator(node,function(o){
		// if(o.className && o.className.match(reg))
		if(isMatchClass(o,className))
		{
			matchs.push(o);
		}
	});
	return matchs;
}

// check wheather the node's classname is equal to the className, return true if they are the same
function isMatchClass(node,className) {
	var classReg = new RegExp('\\b' +　className + '\\b');
	return (node.className && node.className.match(classReg)) ? true : false;
}

// check wheather the node's tagname is equal to the tagName, return true if they are the same
function isMatchTag(node,tagName) {
	var tagReg = new RegExp('\\b' +tagName + '\\b','i');
	return (node.tagName && node.tagName.match(tagReg)) ? true : false;
}


if(typeof Array.prototype.forEach !== 'function')
{
	Array.prototype.forEach = function(fn) {
		if(typeof fn !== 'function') throw new TypeError(fn + ' is not a function');

		var l = this.length;
		for(var i = 0; i < l; i++) {
			fn.call(null,this[i]);
		}
	}
}
window.$ = window.tencent =  tencent;
})(window);