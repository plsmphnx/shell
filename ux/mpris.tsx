import { For } from 'ags';

import Mpris from 'gi://AstalMpris';

import { bind, compute, reduce } from '../lib/sub';
import { Static } from '../lib/util';
import { Action, Icon, Text, Toggle } from '../lib/widget';

const { PLAYING } = Mpris.PlaybackStatus;

const ICONS = {
    Icon: '\u{f075a}',
    Play: '\u{f040a}',
    Pause: '\u{f03e4}',
    Prev: '\u{f04ae}',
    Next: '\u{f04ad}',
    Paused: '\u{f075b}',
};

function length(s: number) {
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${min}:${`0${sec}`.slice(-2)}`;
}

const ICON = Static(() => {
    const players = bind(Mpris.get_default(), 'players');
    return reduce(
        players(ps =>
            compute(ps.map(p => bind(p, 'playback_status')))(ss =>
                ss.every(s => s !== PLAYING) ? ICONS.Paused : ICONS.Icon,
            ),
        ),
    );
});

const player = (p: Mpris.Player) => {
    const pos = bind(p, 'position');
    const len = bind(p, 'length');
    const val = compute([pos, len], (p, l) => (l > 0 ? p / l : 0));
    return (
        <Action
            actions={[
                [ICONS.Prev, () => p.previous(), bind(p, 'can_go_previous')],
                [
                    bind(p, 'playback_status')(s => (s === PLAYING ? ICONS.Pause : ICONS.Play)),
                    () => p.play_pause(),
                    bind(p, 'can_play'),
                ],
                [ICONS.Next, () => p.next(), bind(p, 'can_go_next')],
            ]}>
            <Icon
                from={p}
                icon={[{ file: 'cover_art' }, { url: 'art_url' }]}
                valign={Align.START}
            />
            <Text.Box orientation={Orientation.VERTICAL}>
                <box>
                    <Text class="title" label={bind(p, 'title')(t => t || '')} hexpand wrap />
                    <image
                        iconName={bind(p, 'entry')}
                        tooltipText={bind(p, 'identity')}
                        valign={Align.START}
                    />
                </box>
                <Text class="subtitle" label={bind(p, 'artist')(a => a || '')} wrap />
                <box visible={len(l => l > 0)}>
                    <label label={pos(length)} />
                    <slider
                        hexpand
                        $changeValue={({ value }) => (p.position = value * p.length)}
                        value={val}
                    />
                    <label label={len(length)} />
                </box>
            </Text.Box>
        </Action>
    );
};

export default () => {
    const mpris = Mpris.get_default();
    const players = bind(mpris, 'players');
    return (
        <Toggle
            id="mpris"
            label={ICON()}
            visible={players(p => p.length > 0)}
            $secondary={() => {
                const playing = mpris.players.filter(p => p.playback_status === PLAYING);
                for (const p of playing) {
                    p.pause();
                }
                if (playing.length === 0 && mpris.players.length === 1) {
                    mpris.players[0].play();
                }
            }}>
            <box orientation={Orientation.VERTICAL}>
                <For each={players}>{player}</For>
            </box>
        </Toggle>
    );
};
