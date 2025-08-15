import { Accessor } from 'ags';
import { Gtk } from 'ags/gtk4';

import Wp from 'gi://AstalWp';

import { bind, lazy, listen, popup, reduce, watch } from '../lib/sub';
import { Icon, Select } from '../lib/util';
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

type Props = Status.Props & {
    id: string;
    icons: { Off: string; On: (volume: number) => string };
    device: keyof Select<Wp.Audio, Wp.Endpoint>;
};
const Audio = ({ id, icons, device, ...rest }: Props) => {
    const { audio } = Wp.get_default()!;
    const volume = reduce(
        bind(audio, device).as(dev =>
            watch(dev, ['mute', 'volume'], ({ mute, volume }) => (mute ? 0 : volume)),
        ),
    );
    const icon = volume.as(v => (v === 0 ? icons.Off : icons.On(v)));

    const [pop, pop_] = popup();
    listen(lazy(volume), () => pop_(5000));

    <Popup
        visible={pop}
        transitionType={Transition.SLIDE_UP}
        transitionDuration={1000}
        anchor={Anchor.BOTTOM}>
        <box class="volume">
            <label label={icon} />
            <Gtk.ProgressBar fraction={volume} hexpand valign={Align.CENTER} />
        </box>
    </Popup>;

    return (
        <Status
            id={id}
            label={icon}
            {...rest}
            onSecondary={() => (audio[device].mute = !audio[device].mute)}
        />
    );
};

export const Speaker = () => (
    <Audio id="speaker" icons={ICONS.Speaker} device="default_speaker" />
);

export const Microphone = () => (
    <Audio
        id="microphone"
        icons={ICONS.Microphone}
        device="default_microphone"
        reveal={bind(Wp.get_default()!.audio, 'recorders').as(r => r.length > 0)}
    />
);
