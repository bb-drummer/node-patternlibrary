---
title: 'molecule/categories/list-content'
description: a list of categories
source: './categories-list-content.html'
sass: 
js:
---

This is a markup styled and linked list of categories.

## examples

project-name:
```html_example
<ul class="accordion" data-patternlibrary-accordion data-multi-expand="true" data-allow-all-closed="true" data-deep-link="true" data-update-history>
    <li class="accordion-item row columns" data-accordion-item="">
        <a href="/pl/categories/action" class="accordion-title row columns">
            <div class="columns medium-6 small-12">Name: <strong>action</strong> <i class="fa fa-folder-open"></i></div>
            <div class="columns medium-6 hide-for-small show-for-medium categories">Patterns: <strong>1</strong></div>
        </a>
        <div class="accordion-content" data-tab-content="">
        </div>
    </li>
    <li class="accordion-item row columns" data-accordion-item="">
        <a href="/pl/categories/basics" class="accordion-title row columns">
            <div class="columns medium-6 small-12">Name: <strong>basics</strong> <i class="fa fa-folder-open"></i></div>
            <div class="columns medium-6 hide-for-small show-for-medium categories">Patterns: <strong>5</strong></div>
        </a>
        <div class="accordion-content" data-tab-content="">
        </div>
    </li>
    <li class="accordion-item row columns" data-accordion-item="">
        <a href="/pl/categories/gfx" class="accordion-title row columns">
            <div class="columns medium-6 small-12">Name: <strong>gfx</strong> <i class="fa fa-folder-open"></i></div>
            <div class="columns medium-6 hide-for-small show-for-medium categories">Patterns: <strong>2</strong></div>
        </a>
        <div class="accordion-content" data-tab-content="">
        </div>
    </li>
</ul>
```