import { Binding } from 'astal';
import { Widget } from 'astal/gtk3';

function markup(label: Widget.Label, value?: string) {
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
                self.hook(label, markup);
            } else {
                markup(self, label);
            }
        }}
    />
);
