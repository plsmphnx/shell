import { createBinding, createEffect, createMemo } from 'ags';
import { Gtk } from 'ags/gtk4';

import Wp from 'gi://AstalWp';

import { Icon, popup, Select, Static } from '../lib/util';
import { Popup, Status } from '../lib/widget';

const ICONS = {
    Speaker: {
        Off: '\u{f0e08}',
        On: Icon.select('\u{f057f}', '\u{f0580}', '\u{f057e}'),
    },

    Microphone: {
        Off: '\u{f036d}',
        On: Icon.select('\u{f036c}'),
    },
};

function data(
    device: keyof Select<Wp.Audio, Wp.Endpoint>,
    icons: { Off: string; On: (volume: number) => string },
) {
    const { audio } = Wp.get_default()!;

    const mute = createBinding(audio, device, 'mute');
    const volume = createBinding(audio, device, 'volume');
    const display = createMemo(() => (mute() ? 0 : volume()));

    const icon = display.as(v => (v === 0 ? icons.Off : icons.On(v)));

    const [pop, pop_] = popup();
    createEffect(() => (display(), pop_(5000)));

    const toggle = () => (audio[device].mute = !audio[device].mute);

    return { pop, icon, display, toggle };
}

type Props = Status.Props & { data: ReturnType<typeof data> };
const Audio = ({ id, data, ...rest }: Props) => {
    <Popup
        visible={data.pop}
        transitionType={Transition.SLIDE_UP}
        transitionDuration={1000}
        anchor={Anchor.BOTTOM}>
        <box class="volume">
            <label label={data.icon} />
            <Gtk.ProgressBar fraction={data.display} hexpand valign={Align.CENTER} />
        </box>
    </Popup>;

    return <Status id={id} label={data.icon} {...rest} onSecondary={data.toggle} />;
};

const SPEAKER = Static(() => data('default_speaker', ICONS.Speaker));

export const Speaker = () => <Audio id="speaker" data={SPEAKER()} />;

const MICROPHONE = Static(() => data('default_microphone', ICONS.Microphone));

const RECORDING = Static(() =>
    createBinding(Wp.get_default()!.audio, 'recorders').as(r => r.length > 0),
);

export const Microphone = () => (
    <Audio id="microphone" data={MICROPHONE()} reveal={RECORDING()} />
);
