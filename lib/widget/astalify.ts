import { GObject } from 'astal';
import { astalify, ConstructProps, Gtk } from 'astal/gtk3';

export type CalendarProps = ConstructProps<Calendar, Gtk.Calendar.ConstructorProps>;
export class Calendar extends astalify(Gtk.Calendar) {
    static {
        GObject.registerClass({ GTypeName: 'Calendar' }, this);
    }
    constructor(props?: CalendarProps) {
        super(props as any);
    }
}
