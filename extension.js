import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as QuickSettings from 'resource:///org/gnome/shell/ui/quickSettings.js';


const TemperatureItem = GObject.registerClass(
class TemperatureItem extends QuickSettings.QuickSlider {
    _init() {
        super._init({
            iconName: 'weather-clear-night',
        });

	this.minimum = 1500;
        this.maximum = 6500;

	this._settings = new Gio.Settings({schema_id: "org.gnome.settings-daemon.plugins.color"});

        this.slider.accessible_name = _('NightLightTemperature');

        this.slider.value = (this._settings.get_uint('night-light-temperature') - this.minimum) / (this.maximum - this.minimum);

    	this._sliderChangedId = this.slider.connect('notify::value',
	this._sliderChanged.bind(this));
	
    }

    _changeSlider(value) {
        this.slider.block_signal_handler(this._sliderChangedId);
        this.slider.value = value;
        this.slider.unblock_signal_handler(this._sliderChangedId);
    }


    _sliderChanged() {
        this._settings.set_uint('night-light-temperature', this.slider.value * (this.maximum - this.minimum) + this.minimum);
    }


});

export const ExampleIndicator = GObject.registerClass(
class ExampleIndicator extends QuickSettings.SystemIndicator {
    _init() {
        super._init();

        this.quickSettingsItems.push(new TemperatureItem());
    }
});


export default class SimpleNightLightSlider extends Extension {
    enable() {
        this._indicator = new ExampleIndicator(this);
        Main.panel.statusArea.quickSettings.addExternalIndicator(this._indicator, 2);
    }

    disable() {
        this._indicator.quickSettingsItems.forEach(item => item.destroy());
        this._indicator.destroy();
        this._indicator = null;
    }

}
