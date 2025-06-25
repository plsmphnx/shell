import { Accessor } from 'ags';
import { Gtk } from 'ags/gtk4';

import Wp from 'gi://AstalWp';

import { bind, lazy, listen, popup, reduce, watch } from '../lib/sub';
import { Icon, Select, Static } from '../lib/util';
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

function volume(device: keyof Select<Wp.Audio, Wp.Endpoint>) {
    return reduce(
        bind(Wp.get_default()!.audio, device).as(dev =>
            watch(dev, ['mute', 'volume'], ({ mute, volume }) => (mute ? 0 : volume)),
        ),
    );
}

const SPEAKER = Static(() => volume('default_speaker'));

const MICROPHONE = Static(() => volume('default_microphone'));

type Props = Status.Props & {
    id: string;
    icons: { Off: string; On: (volume: number) => string };
    volume: Accessor<number>;
};
const Audio = ({ id, icons, volume, ...rest }: Props) => {
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

    return <Status id={id} label={icon} {...rest} />;
};

export const Speaker = () => <Audio id="speaker" icons={ICONS.Speaker} volume={SPEAKER()} />;

export const Microphone = () => (
    <Audio
        id="microphone"
        icons={ICONS.Microphone}
        volume={MICROPHONE()}
        reveal={bind(Wp.get_default()!.audio, 'recorders').as(r => r.length > 0)}
    />
);
