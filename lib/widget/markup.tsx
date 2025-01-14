import { Binding } from 'astal';
import { Gtk, hook, Widget } from 'astal/gtk4';

function markup(label: Gtk.Label, value?: string) {
    if (value) {
        if (/<a|&\w+;/.test(value)) {
            label.set_markup(value);
        } else {
            label.label = value;
        }
    }
}

export interface Props extends Widget.LabelProps {}
export default ({ label, setup, ...rest }: Props) => (
    <label
        {...rest}
        useMarkup
        setup={self => {
            if (label instanceof Binding) {
                markup(self, label.get());
                hook(self, label, markup);
            } else {
                markup(self, label);
            }
        }}
    />
);
