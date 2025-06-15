import Wp from 'gi://AstalWp';

import { bind, reduce, watch } from '../lib/sub';
import { Config, Icon, Select, Static } from '../lib/util';
import { Status } from '../lib/widget';

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

function icon(
    icons: { Off: string; On: (volume: number) => string },
    device: keyof Select<Wp.Audio, Wp.Endpoint>,
) {
    const dev = bind(Wp.get_default()!.audio, device);
    return reduce(
        dev(dev =>
            watch(dev, ['mute', 'volume'], ({ mute, volume }) =>
                mute || volume === 0 ? icons.Off : icons.On(volume),
            ),
        ),
    );
}

const SPEAKER = Static(() => icon(ICONS.Speaker, 'default_speaker'));

const MICROPHONE = Static(() => icon(ICONS.Microphone, 'default_microphone'));

export const Speaker = () => <Status label={SPEAKER()} {...Config.utils('speaker')} />;

export const Microphone = () => (
    <Status
        label={MICROPHONE()}
        {...Config.utils('microphone')}
        visible={bind(Wp.get_default()!.audio, 'recorders')(r => r.length > 0)}
    />
);
