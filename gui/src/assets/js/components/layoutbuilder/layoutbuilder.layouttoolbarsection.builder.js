/**
 * LayouttoolbarsectionBuilder module.
 * 
 * @module patternlibrary.LayouttoolbarsectionBuilder
 * 
 * @requires patternlibrary.Layouttoolbarsection
 */
var LayouttoolbarsectionBuilder = {
	name  : 'builder',
	items : [
		{
			type  : 'action',
			label : 'load layout',
			action: '#load_layout',
			icon  : 'fa fa-folder-open'
		},
		{
			type  : 'action',
			label : 'save layout',
			action: '#load_layout',
			icon  : 'fa fa-save'
		},
		{   type  : 'separator' },
		{
			type  : 'action',
			label : 'show source',
			action: '#show_source',
			icon  : 'fa fa-code'
		},
		{   type  : 'separator' },
		{
			type  : 'action',
			label : 'switch fullscreen',
			action: '#switch_fullscreen',
			icon  : 'fa fa-tv',
			events: {
			    click : (e) => {
			    	//var $layoutbody = $('[data-layoutbody]');
			    	var $this = $(e.currentTarget).data('patternlibraryPlugin');
			        if (patternlibrary.debug()) console.log('layouttoolbaraction fullscreen switch clicked:', e, $this);
			    	//$layoutbody.data('patternlibraryPlugin').switchFullscreen();
			    	$this._layoutbody.switchFullscreen();
		            e.stopPropagation();
		            e.preventDefault();
			        if (patternlibrary.debug()) console.log('layouttoolbaraction fullscreen switch click');
				}
			}
		},
		{   type  : 'separator' },
		{
			type  : 'action',
			label : 'edit settings',
			action: '#edit_settings',
			icon  : 'fa fa-cogs'
		}
	]
};
