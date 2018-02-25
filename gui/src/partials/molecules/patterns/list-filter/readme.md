---
title: 'molecule/patterns/list-filter'
description: filter or navigation bar for pattern (groups)
source: './patterns-list-filter.html'
example: './example.html'
sass: 
js:
---

This is a markup styled and linked list of patterns.

## examples

project-name:
```html_example
<div class="row">
    <div class="row large-12 columns">
    
        <div class="title-bar" data-responsive-toggle="pl-patternlist-filter" data-hide-for="medium" data-e="pt2ly1-e" style="display: none;">
            <button class="menu-icon" type="button" data-toggle="pl-patternlist-filter"></button>
            <div class="title-bar-title">Patterns</div>
        </div>

        <div class="top-bar filter" id="pl-patternlist-filter">
            <div class="top-bar-left">
                <ul class="dropdown menu" data-dropdown-menu="" role="menubar" data-e="881une-e">
                    <li class="menu-text hide-for-small show-for-medium" role="menuitem">Patterns:</li>
                    <li class="hide-for-small show-for-medium" role="menuitem"><a href="/pl/patterns/atoms"><i class="fa fa-square-o"></i> <span>Atoms</span></a></li>
                    <li class="hide-for-small show-for-medium" role="menuitem"><a href="/pl/patterns/molecules"><i class="fa fa-cube"></i> <span>Molecules</span></a></li>
                    <li class="hide-for-small show-for-medium" role="menuitem"><a href="/pl/patterns/organisms"><i class="fa fa-cubes"></i> <span>Organisms</span></a></li>
                    <li class="hide-for-small show-for-medium" role="menuitem"><a href="/pl/patterns/templates"><i class="fa fa-file-picture-o"></i> <span>Templates</span></a></li>
                    <li class="show-for-small hide-for-medium is-dropdown-submenu-parent opens-right" role="menuitem" aria-haspopup="true" aria-label=" Patterns">
                        <a href="#"><i class="fa fa-list"></i> <span>Patterns</span></a> 
                        <ul class="menu vertical submenu is-dropdown-submenu first-sub" data-submenu="" role="menu">
                            <li role="menuitem" class="is-submenu-item is-dropdown-submenu-item"><a href="/pl/patterns/atoms"><i class="fa fa-square-o"></i> <span>Atoms</span></a></li>
                            <li role="menuitem" class="is-submenu-item is-dropdown-submenu-item"><a href="/pl/patterns/molecules"><i class="fa fa-cube"></i> <span>Molecules</span></a></li>
                            <li role="menuitem" class="is-submenu-item is-dropdown-submenu-item"><a href="/pl/patterns/organisms"><i class="fa fa-cubes"></i> <span>Organisms</span></a></li>
                            <li role="menuitem" class="is-submenu-item is-dropdown-submenu-item"><a href="/pl/patterns/templates"><i class="fa fa-file-picture-o"></i> <span>Templates</span></a></li>
                        </ul>
                    </li>
                    <li role="menuitem" class="is-dropdown-submenu-parent opens-right" aria-haspopup="true" aria-label=" Categories">
                        <a href="/pl/categories"><i class="fa fa-list"></i> <span>Categories</span></a> 
                        <ul class="menu vertical submenu is-dropdown-submenu first-sub" data-submenu="" role="menu">
                          
                            <li role="menuitem" class="is-submenu-item is-dropdown-submenu-item"><a href="/pl/categories/action"><i class="fa fa-folder-o"></i>action</a><!-- /categories/action --></li>
                            <li role="menuitem" class="is-submenu-item is-dropdown-submenu-item"><a href="/pl/categories/basics"><i class="fa fa-folder-o"></i>basics</a><!-- /categories/basics --></li>
                            <li role="menuitem" class="is-submenu-item is-dropdown-submenu-item"><a href="/pl/categories/gfx"><i class="fa fa-folder-o"></i>gfx</a><!-- /categories/gfx --></li>
                            <li role="menuitem" class="is-submenu-item is-dropdown-submenu-item"><a href="/pl/categories/lists"><i class="fa fa-folder-o"></i>lists</a><!-- /categories/lists --></li>
                            <li role="menuitem" class="is-submenu-item is-dropdown-submenu-item"><a href="/pl/categories/modal"><i class="fa fa-folder-o"></i>modal</a><!-- /categories/modal --></li>
                            <li role="menuitem" class="is-submenu-item is-dropdown-submenu-item"><a href="/pl/categories/texts"><i class="fa fa-folder-o"></i>texts</a><!-- /categories/texts --></li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</div>
```