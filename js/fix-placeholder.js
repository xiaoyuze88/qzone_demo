// fix input placeholder in ie 6,7,8
$.onReady(function() {
	var inputs = $.find('input');
	var l = inputs.length;
	var _placeholder;

	inputs.forEach(function(x,i){
		if(x && x.getAttribute && (_placeholder = x.getAttribute("placeholder")))
		{
			setVal(x,_placeholder);
			$.on(x,'focus',onFocus);
			$.on(x,'blur',onBlur);
		}
	});
	
// return the input value
	function getVal(o)
	{
		return o.value;
	}
// set the input value
	function setVal(o,str)
	{
		o.value = str;
	}
// get the input placeholder value
	function getPlaceholder(o)
	{
		if(o.getAttribute)
		{
			return o.getAttribute("placeholder");
		}
		else
		{
			return '';
		}
	}
// clear value
	function clearPlaceholder(o)
	{
		setVal(o,'');
	}
// if the value is empty, reset the placeholder
	function onBlur()
	{
		if(!getVal(this)) setVal(this,getPlaceholder(this));
	}
// if the value is equals to the placeholder , clear the value
	function onFocus()
	{
		if(getVal(this) == getPlaceholder(this)) clearPlaceholder(this);
	}
});