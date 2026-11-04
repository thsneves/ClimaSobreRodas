"use strict";
/**
 * =========================================================================
 * NixSelect Vanilla JavaScript Engine
 * Author: WPTechnix (https://wptechnix.com/)
 * Description: Zero-dependency, accessible, plug-and-play custom select.
 * =========================================================================
 */
class NixSelect {
    wrapper;
    nativeSelect;
    trigger;
    dropdown;
    searchInput = null;
    noResults = null;
    options = [];
    isMultiple;
    isSearchable;
    placeholder;
    activeIndex = 0;
    constructor(element, options = {}) {
        this.wrapper = element;
        const native = this.wrapper.querySelector('select');
        if (!native)
            throw new Error('[NixSelect] Underlying <select> element not found.');
        this.nativeSelect = native;
        this.isMultiple = options.multiple ?? (this.wrapper.dataset.multiple === 'true' || this.nativeSelect.multiple);
        this.isSearchable = options.searchable ?? (this.wrapper.dataset.searchable === 'true');
        this.placeholder = options.placeholder || this.wrapper.dataset.placeholder || 'Choose option...';
        this.buildUI();
        this.bindEvents();
        this.syncUI();
    }
    buildUI() {
        // 1. Create Trigger Button
        this.trigger = document.createElement('button');
        this.trigger.type = 'button';
        this.trigger.className = 'nix-select__trigger';
        this.trigger.setAttribute('aria-haspopup', 'listbox');
        this.trigger.setAttribute('aria-expanded', 'false');
        const display = document.createElement('div');
        display.className = 'nix-select__display';
        const arrow = document.createElement('span');
        arrow.className = 'nix-select__arrow';
        arrow.innerHTML = `
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    `;
        this.trigger.appendChild(display);
        this.trigger.appendChild(arrow);
        // 2. Create Floating Dropdown
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'nix-select__dropdown';
        this.dropdown.setAttribute('role', 'listbox');
        if (this.isMultiple)
            this.dropdown.setAttribute('aria-multiselectable', 'true');
        this.dropdown.tabIndex = -1;
        // Search bar
        if (this.isSearchable) {
            const searchBox = document.createElement('div');
            searchBox.className = 'nix-select__search';
            searchBox.innerHTML = `
        <svg class="nix-select__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="search" class="nix-select__search-input" placeholder="Type to filter..." autocomplete="off" />
      `;
            this.searchInput = searchBox.querySelector('.nix-select__search-input');
            this.dropdown.appendChild(searchBox);
        }
        // Options list
        const optionsList = document.createElement('ul');
        optionsList.className = 'nix-select__options';
        Array.from(this.nativeSelect.options).forEach((opt) => {
            if (!opt.value && !this.isMultiple)
                return; // Skip empty placeholder option in single-select
            const li = document.createElement('li');
            li.className = 'nix-select__option';
            li.setAttribute('role', 'option');
            li.dataset.value = opt.value;
            li.setAttribute('aria-selected', opt.selected ? 'true' : 'false');
            if (opt.selected)
                li.classList.add('is-selected');
            if (opt.disabled)
                li.classList.add('is-disabled');
            li.innerHTML = `
        <span class="nix-select__option-label">${opt.text}</span>
        <svg class="nix-select__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
            this.options.push(li);
            optionsList.appendChild(li);
        });
        this.noResults = document.createElement('li');
        this.noResults.className = 'nix-select__no-results';
        this.noResults.textContent = 'No matching options found';
        this.noResults.style.display = 'none';
        optionsList.appendChild(this.noResults);
        this.dropdown.appendChild(optionsList);
        this.wrapper.appendChild(this.trigger);
        this.wrapper.appendChild(this.dropdown);
    }
    bindEvents() {
        // Trigger Click
        this.trigger.addEventListener('click', (e) => {
            const target = e.target;
            const chipRemove = target.closest('.nix-select__chip-remove');
            if (chipRemove) {
                e.preventDefault();
                e.stopPropagation();
                const chip = chipRemove.closest('.nix-select__chip');
                if (chip?.dataset.value)
                    this.deselectValue(chip.dataset.value);
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            this.isOpen() ? this.close() : this.open();
        });
        // Option Click
        this.dropdown.addEventListener('click', (e) => {
            const targetOption = e.target.closest('.nix-select__option');
            if (targetOption) {
                e.preventDefault();
                e.stopPropagation();
                this.selectOption(targetOption);
            }
        });
        // Real-time Search Filter
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => {
                this.filterOptions(this.searchInput.value);
            });
            this.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.focusNextOption(-1, 1);
                }
                else if (e.key === 'Escape') {
                    e.preventDefault();
                    this.close();
                    this.trigger.focus();
                }
            });
        }
        // Keyboard Navigation
        this.wrapper.addEventListener('keydown', (e) => {
            if (!this.isOpen()) {
                if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
                    e.preventDefault();
                    this.open();
                }
                return;
            }
            switch (e.key) {
                case 'Escape':
                    e.preventDefault();
                    this.close();
                    this.trigger.focus();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.focusNextOption(this.activeIndex, 1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.focusNextOption(this.activeIndex, -1);
                    break;
                case 'Home':
                    e.preventDefault();
                    this.focusNextOption(-1, 1);
                    break;
                case 'End':
                    e.preventDefault();
                    this.focusNextOption(this.options.length, -1);
                    break;
                case 'Enter':
                case ' ':
                    if (document.activeElement?.classList.contains('nix-select__option')) {
                        e.preventDefault();
                        this.selectOption(document.activeElement);
                    }
                    break;
            }
        });
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.wrapper.contains(e.target)) {
                this.close();
            }
        });
        // Native select change sync
        this.nativeSelect.addEventListener('change', () => this.syncFromNative());
    }
    open() {
        if (this.trigger.disabled)
            return;
        // Close all other instances
        document.querySelectorAll('.nix-select.is-open').forEach((el) => {
            if (el !== this.wrapper)
                el.classList.remove('is-open', 'open-upwards');
        });
        // Collision detection: check space below
        const triggerRect = this.trigger.getBoundingClientRect();
        const spaceBelow = window.innerHeight - triggerRect.bottom;
        const dropdownHeight = this.dropdown.offsetHeight || 250;
        const shouldOpenUpwards = spaceBelow < dropdownHeight && triggerRect.top > dropdownHeight;
        this.wrapper.classList.toggle('open-upwards', shouldOpenUpwards);
        this.wrapper.classList.add('is-open');
        this.trigger.setAttribute('aria-expanded', 'true');
        if (this.searchInput) {
            this.searchInput.value = '';
            this.filterOptions('');
            setTimeout(() => this.searchInput?.focus(), 50);
        }
        else {
            this.options[this.activeIndex]?.focus();
        }
    }
    close() {
        this.wrapper.classList.remove('is-open', 'open-upwards');
        this.trigger.setAttribute('aria-expanded', 'false');
        if (this.searchInput) {
            this.searchInput.value = '';
            this.filterOptions('');
        }
    }
    isOpen() {
        return this.wrapper.classList.contains('is-open');
    }
    filterOptions(query) {
        const q = query.toLowerCase().trim();
        let matches = 0;
        this.options.forEach((opt) => {
            const text = opt.querySelector('.nix-select__option-label')?.textContent?.toLowerCase() || '';
            const isMatch = !q || text.includes(q);
            opt.style.display = isMatch ? 'flex' : 'none';
            if (isMatch)
                matches++;
        });
        if (this.noResults) {
            this.noResults.style.display = matches === 0 ? 'block' : 'none';
        }
    }
    focusNextOption(startIdx, direction) {
        const visible = this.options.filter((o) => o.style.display !== 'none' && !o.classList.contains('is-disabled'));
        if (visible.length === 0)
            return;
        const currentFocused = document.activeElement;
        const curIdx = visible.indexOf(currentFocused);
        let nextIdx = curIdx === -1 ? 0 : curIdx + direction;
        if (nextIdx >= visible.length)
            nextIdx = 0;
        if (nextIdx < 0)
            nextIdx = visible.length - 1;
        this.activeIndex = this.options.indexOf(visible[nextIdx]);
        visible[nextIdx]?.focus();
    }
    selectOption(opt) {
        if (opt.classList.contains('is-disabled'))
            return;
        const val = opt.dataset.value ?? '';
        if (this.isMultiple) {
            const isSelected = opt.classList.contains('is-selected');
            opt.classList.toggle('is-selected', !isSelected);
            opt.setAttribute('aria-selected', !isSelected ? 'true' : 'false');
        }
        else {
            this.options.forEach((o) => {
                const matched = o === opt;
                o.classList.toggle('is-selected', matched);
                o.setAttribute('aria-selected', matched ? 'true' : 'false');
            });
            this.close();
            this.trigger.focus();
        }
        this.syncToNative();
        this.syncUI();
    }
    deselectValue(val) {
        const opt = this.options.find((o) => o.dataset.value === val);
        if (opt) {
            opt.classList.remove('is-selected');
            opt.setAttribute('aria-selected', 'false');
            this.syncToNative();
            this.syncUI();
        }
    }
    syncToNative() {
        if (this.isMultiple) {
            const selectedVals = new Set(this.options.filter((o) => o.classList.contains('is-selected')).map((o) => o.dataset.value));
            Array.from(this.nativeSelect.options).forEach((opt) => {
                opt.selected = selectedVals.has(opt.value);
            });
        }
        else {
            const selected = this.options.find((o) => o.classList.contains('is-selected'));
            this.nativeSelect.value = selected ? selected.dataset.value || '' : '';
        }
        this.nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
    syncFromNative() {
        if (this.isMultiple) {
            const selectedVals = new Set(Array.from(this.nativeSelect.selectedOptions).map((o) => o.value));
            this.options.forEach((o) => {
                const isSel = selectedVals.has(o.dataset.value || '');
                o.classList.toggle('is-selected', isSel);
                o.setAttribute('aria-selected', isSel ? 'true' : 'false');
            });
        }
        else {
            const currentVal = this.nativeSelect.value;
            this.options.forEach((o) => {
                const isSel = o.dataset.value === currentVal;
                o.classList.toggle('is-selected', isSel);
                o.setAttribute('aria-selected', isSel ? 'true' : 'false');
            });
        }
        this.syncUI();
    }
    syncUI() {
        const display = this.trigger.querySelector('.nix-select__display');
        if (!display)
            return;
        const selected = this.options.filter((o) => o.classList.contains('is-selected'));
        if (this.isMultiple) {
            display.innerHTML = '';
            if (selected.length === 0) {
                display.innerHTML = `<span class="nix-select__placeholder">${this.placeholder}</span>`;
            }
            else {
                selected.forEach((opt) => {
                    const val = opt.dataset.value ?? '';
                    const text = opt.querySelector('.nix-select__option-label')?.textContent?.trim() ?? '';
                    const chip = document.createElement('span');
                    chip.className = 'nix-select__chip';
                    chip.dataset.value = val;
                    chip.innerHTML = `
            <span class="nix-select__chip-text">${text}</span>
            <span class="nix-select__chip-remove" role="button" aria-label="Remove ${text}">&times;</span>
          `;
                    display.appendChild(chip);
                });
            }
        }
        else {
            display.innerHTML = selected[0]
                ? `<span class="nix-select__selected-text">${selected[0].querySelector('.nix-select__option-label')?.textContent}</span>`
                : `<span class="nix-select__placeholder">${this.placeholder}</span>`;
        }
    }
    static initAll(selector = '[data-nix-select]') {
        return Array.from(document.querySelectorAll(selector)).map((el) => new NixSelect(el));
    }
}
// Self-hydrating initialization (runs immediately in CodePen iframe)
function bootNixSelect() {
    NixSelect.initAll();
    // Dark/Light Theme Switcher
    const themeBtn = document.getElementById('nix-theme-btn');
    themeBtn?.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', nextTheme);
    });
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootNixSelect);
}
else {
    bootNixSelect();
}
