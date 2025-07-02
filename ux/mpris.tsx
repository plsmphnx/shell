import { For } from 'ags';

import Mpris from 'gi://AstalMpris';

import { bind, compute, reduce } from '../lib/sub';
import { Config, Static, time } from '../lib/util';
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

const ICON = Static(() =>
    reduce(
        bind(Mpris.get_default(), 'players').as(ps =>
            compute(
                ps.map(p => bind(p, 'playback_status')),
                (...ss) => (ss.every(s => s !== PLAYING) ? ICONS.Paused : ICONS.Icon),
            ),
        ),
    ),
);

const player = (p: Mpris.Player) => {
    const pos = bind(p, 'position');
    const len = bind(p, 'length');
    const val = compute([pos, len], (p, l) => (l > 0 ? p / l : 0));
    return (
        <Action
            actions={[
                [ICONS.Prev, () => p.previous(), bind(p, 'can_go_previous')],
                [
                    bind(p, 'playback_status').as(s =>
                        s === PLAYING ? ICONS.Pause : ICONS.Play,
                    ),
                    () => p.play_pause(),
                    bind(p, 'can_play'),
                ],
                [ICONS.Next, () => p.next(), bind(p, 'can_go_next')],
            ]}>
            <Icon from={p} icon="cover_art art_url" valign={Align.START} />
            <Text.Box orientation={Orientation.VERTICAL}>
                <box>
                    <Text class="title" label={bind(p, 'title')} hexpand wrap />
                    <image
                        iconName={bind(p, 'entry')}
                        pixelSize={Config.Size.Text}
                        tooltipText={bind(p, 'identity')}
                    />
                </box>
                <Text class="subtitle" label={bind(p, 'artist')} wrap />
                <box visible={len.as(l => l > 0)}>
                    <label label={pos.as(time)} />
                    <slider
                        hexpand
                        onChangeValue={({ value }) => {
                            p.position = value * p.length;
                        }}
                        value={val}
                    />
                    <label label={len.as(time)} />
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
            reveal={players.as(p => p.length > 0)}
            onSecondary={() => {
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
