$.onReady(function(){
	var label_container = $.find('#visited-label-container');

// 谁看过我  跳转标签
	$.on(label_container,'click',function(e){
		e = e || window.event;
		var target = e.srcElement || e.target;

		if(target.id == "left-label")
		{
			if(this.className.indexOf("active-left") > -1)
			{
			//当前激活的就是left-label，不做处理
				return false;
			}
			else if(this.className.indexOf("active-right") > -1)
			{
				this.className = this.className.replace("active-right","active-left");
				// 激活左边标签，对dom操作添加在此
			}
		}
		else if(target.id == "right-label")
		{
			if(this.className.indexOf("active-right") > -1)
			{
				return false;
			}
			else if(this.className.indexOf("active-left") > -1)
			{
				this.className = this.className.replace("active-left","active-right");
				// 激活右边标签，对dom操作添加在此
			}
		}
	});
	
	// click the close tab
	$.on($.find("#visited-section"),'click',function(e) {
		e = e || window.event;
		var target = e.srcElement || e.target;
		if(target.className.indexOf("sprite-visited-close") > -1)
		{
			$.parent(target,".visited-btns").style.display = 'none';
		}
	})

// 	将mouseout和mouseover事件delegate给visited-section
	function onMouseOver(e) {
		e = e || window.event;
		var target = e.srcElement || e.target;
		
		//当mouseover过visited-inline或其中元素，且这个visited-inline中没有visited-btns，创建btns并插入到visited-option中,
		//否则不作操作
		var parent = target.className.indexOf('visited-inline') > -1 ? target : 
			$.parent(target,'.visited-inline') ? $.parent(target,'.visited-inline') : null;

		// 检查mouseover是否从parent的子元素移过来的，如果是，忽略，如果不是，表示鼠标是从容器外进入的
		if( parent && $.checkMouseoverFrom(parent,e) )
		{
			// 如果里没还没有btns，append之；如果已有，display：none
			if($.find(".visited-btns",parent).length === 0)
			{
				$.find(".visited-option",parent)[0].appendChild(makeBtn());	
			}
			else
			{
				$.find(".visited-btns",parent)[0].style.display = '';
			}
		}
	}

	function onMouseOut(e) {
		e = e || window.event;
		var target = e.srcElement || e.target;
		var parent = target.className.indexOf('visited-inline') > -1 ? target : 
			$.parent(target,'.visited-inline') ? $.parent(target,'.visited-inline') : null;

		// 检查mouseout是否是移动到子元素，如果是，忽略；如果不是，表示鼠标移了parent
		if(parent && $.checkMouseoutTo(parent,e) && $.find(".visited-btns",parent).length > 0)
		{
			$.find(".visited-btns",parent)[0].style.display = 'none';
		}
	}

	$.on($.find("#visited-section"),'mouseover',onMouseOver)
	$.on($.find("#visited-section"),'mouseout',onMouseOut)


// 鼠标经过导航栏，箭头随着鼠标移动
	var nav_arrow  = $.find("#nav_arrow");
	var nav_ul = $.find('.nav-ul')[0];

// 绑定鼠标进入导航条事件
	$.on(nav_ul,'mouseover',function(e) {
		e = e || window.event;
		var target = e.srcElement || e.target;
		var parent = target.className.indexOf('nav-li ') > -1 ? target : 
			$.parent(target,'.nav-li') ? $.parent(target,'.nav-li') : null;
		var index,new_class;
		// 移动到当前激活栏，不做操作
		if(!parent) return false;

		if(parent && $.checkMouseoverFrom(parent,e))
		{
			index = getIndex($.parent(parent,'.nav-ul'),parent);
			new_class = 'active-' + index;
			// 激活当前态，返回
			
			
			if(check_css3_transition())
			{
				if(nav_arrow.className.indexOf(new_class) > -1) return false;
				nav_arrow.className = nav_arrow.className.replace(/active-\d/,new_class);
			}
			// for ie 6,7,8
			else
			{
				var new_left = nav_arrow_list[new_class];
				var old_left = nav_arrow.offsetLeft;
				if(nav_arrow.animation && typeof nav_arrow.animation.stop === 'function')
				{
					nav_arrow.animation.stop();
				}

				nav_arrow.animation = animation_left(nav_arrow,old_left,new_left,function(){
					nav_arrow.className = nav_arrow.className.replace(/active-\d/,new_class);
				})
			}
		}
	});

// 绑定鼠标移出导航条事件
	$.on(nav_ul,'mouseout',function(e) {
		e = e || window.event;
		var target = e.srcElement || e.target;
		var index,new_class;
		if($.checkMouseoutTo(this,e))
		{
			index = getIndex(this,$.find(".active",this)[0]);
			new_class = 'active-' + index;
			if(check_css3_transition())
			{
				// 激活当前态，返回
				if(nav_arrow.className.indexOf(new_class) > -1) return false;

				nav_arrow.className = nav_arrow.className.replace(/active-\d/,new_class);
			}
			// for ie 6,7,8
			else
			{
				var new_left = nav_arrow_list[new_class];
				var old_left = nav_arrow.offsetLeft;

				if(nav_arrow.animation && typeof nav_arrow.animation.stop === 'function')
				{
					nav_arrow.animation.stop();
				}
				nav_arrow.animation = animation_left(nav_arrow,old_left,new_left,function(){
					nav_arrow.className = nav_arrow.className.replace(/active-\d/,new_class);
				})
			}
		}
	})

	// 点击导航标签，转换active
	$.on(nav_ul,'click',function(e){
		e = e || window.event;
		var target = e.srcElement || e.target;
		var parent = target.className.indexOf('nav-li ') > -1 ? target : 
			$.parent(target,'.nav-li ') ? $.parent(target,'.nav-li ') : null;

		if(parent && parent.className.indexOf('active') === -1)
		{
			var old_active = $.find(".active",this)[0];
			old_active.className = old_active.className.replace("active",'');
			parent.className += ' active';

			// 这里切换当前激活标签，若有dom操作放于此
		}
	})
	
	// 返回该元素在其父容器nodelist中的下标
	function getIndex(pdom,child)
	{
		var list = pdom.childNodes;
		var index = 0;
		if(list && list.length > 0)
		{
			for(var i = 0,l = list.length; i < l; i++)
			{
				if(list[i].nodeType === 1)
				{
					index++;
					if(list[i] === child) return index;
				}
			}
		}
		return false;
	}

	// o表示要移动的dom对象，from/to是你要移动的起始/结束位置，Number类型； completecallback是动画结束后的callback	
	function animation_left(o,from,to,completeCallback) {
		if(typeof from !== 'number' || typeof to !== 'number') return false;
		
		var stop;
		if(from > to) 
		{
			stop = $.animate(100,50,function(p) {
				// p = Math.sqrt(p);
				p = -p*p + 2*p;
				o.style.left = (from - (from - to)*p) + 'px';
			},completeCallback);
		}
		else if(from < to) 
		{
			stop = $.animate(100,50,function(p) {
				// p = Math.sqrt(p);
				p = -p*p + 2*p;
				o.style.left = (from + (to - from)*p) + 'px';
			},completeCallback);
		}
		return stop;
	}

// 检查用户浏览器是否支持css3的transition属性
	function check_css3_transition()
	{
		var transition_list = ['-webkit-transition','-ms-transition','-moz-transition','-o-transition','transition'];
		var len = transition_list.length;
		var div = document.createElement('div');
		while(len--)
		{
			if(transition_list[len] in div.style) return true;
		}
		return false;
	}


	// cache positions
	// IE6,7 and IE8 have diffent style
	var nav_arrow_list = $.checkUserAgent().indexOf('IE 8.0') > -1 ? {
		'active-1' : 2,
		'active-2' : 64,
		'active-3' : 126,
		'active-5' : 213
	}:
	{
		'active-1' : 6,
		'active-2' : 69,
		'active-3' : 131,
		'active-5' : 218
	}

	// 创建一个btns element
	function makeBtn()
	{
		var father = document.createElement('div');
		father.className = "visited-option visited-btns";
		// a 1
		var a1 = document.createElement('a');
		a1.href = "javascript:;";
		a1.title = "留言";
		a1.className = "visited-btn";
		var inner1 = document.createElement('div');
		inner1.className = "visited-message-container sprite-container";
		var img1 = document.createElement('img');
		img1.src = "img/sprite.png";
		img1.className = "sprite sprite-visited-message";
		img1.alt = "留言";
		inner1.appendChild(img1);
		a1.appendChild(inner1);

		// a 2
		var a2 = document.createElement('a');
		a2.href = "javascript:;";
		a2.title = "关闭";
		a2.className = "visited-btn";
		var inner2 = document.createElement('div');
		inner2.className = "visited-close-container sprite-container";
		var img2 = document.createElement('img');
		img2.src = "img/sprite.png";
		img2.className = "sprite sprite-visited-close";
		img2.alt = "关闭";
		inner2.appendChild(img2);
		a2.appendChild(inner2);

		// insert into father
		father.appendChild(a1);
		father.appendChild(a2);
		return father;
	}

});
