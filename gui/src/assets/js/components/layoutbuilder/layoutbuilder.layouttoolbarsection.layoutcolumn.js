/**
 * LayouttoolbarsectionLayoutcolumn module.
 * 
 * @module patternlibrary.LayouttoolbarsectionLayoutcolumn
 * 
 * @requires patternlibrary.Layouttoolbarsection
 */
var LayouttoolbarsectionLayoutcolumn = {
	name  : 'layoutcolumn',
	items : [
		/*{
			type  : 'action',
			label : 'move element',
			action: '#move_element',
			icon  : 'fa fa-bars fa-rotate-90',
			events: {
			    click : LayoutbuilderClickdummy
			}
		},
		{   type  : 'separator' },*/
		{
			type  : 'action',
			label : 'add column',
			action: '#add_column',
			icon  : 'fa fa-plus',
			events: {
			    click : LayoutbuilderClickdummy
			}
		},
		{
			type  : 'action',
			label : 'remove row',
			action: '#remove_row',
			icon  : 'fa fa-minus',
			events: {
			    click : LayoutbuilderClickdummy
			}
		},
		{   type  : 'separator' },
		{
			type  : 'action',
			label : 'add pattern',
			action: '#add_pattern',
			icon  : 'fa fa-puzzle-piece',
			events: {
			    click : LayoutbuilderClickdummy
			}
		},
		{   type  : 'separator' },
		{
			type  : 'action',
			label : 'edit settings',
			action: '#edit_settings',
			icon  : 'fa fa-cogs',
			events: {
			    click : LayoutbuilderClickdummy
			}
		}
	]
};
