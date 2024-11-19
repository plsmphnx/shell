import { bind } from 'astal';
import Wp from 'gi://AstalWp';

import { select } from '../lib/icons';
import { join, reduce } from '../lib/sub';
import { Select } from '../lib/util';
import { Status } from '../lib/widget';

const ICONS = {
    Speaker: {
        Off: '\u{f0e08}',
        On: select('\u{f057f}', '\u{f0580}', '\u{f057e}'),
    },

    Microphone: {
        Off: '\u{f036d}',
        On: select('\u{f036c}'),
    },
};

const audio = Wp.get_default()!.audio;

function icon(
    icons: { Off: string; On: (volume: number) => string },
    device: keyof Select<Wp.Audio, Wp.Endpoint>,
) {
    const dev = bind(audio, device);
    return join(
        reduce(dev.as(d => bind(d, 'mute'))),
        reduce(dev.as(d => bind(d, 'volume'))),
    ).as((mute, volume) => (mute || volume === 0 ? icons.Off : icons.On(volume)));
}

const speaker = icon(ICONS.Speaker, 'default_speaker');
const microphone = icon(ICONS.Microphone, 'default_microphone');

export const Speaker = () => <Status label={speaker} onPrimary="pavucontrol" />;

export const Microphone = () => (
    <Status
        label={microphone}
        onPrimary="pavucontrol"
        reveal={bind(audio, 'recorders').as(r => r.length > 0)}
    />
);
