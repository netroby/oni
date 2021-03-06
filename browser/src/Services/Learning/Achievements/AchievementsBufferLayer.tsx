/**
 * AchievementsBufferLayer.tsx
 *
 * This is an implementation of a buffer layer to show the
 * achievements in a 'trophy-case' style view
 */

import * as React from "react"

import styled from "styled-components"

import { BufferLayerHeader } from "./../../../UI/components/BufferLayerHeader"
import { Bold, boxShadow, Fixed, Full, withProps } from "./../../../UI/components/common"
import { FlipCard } from "./../../../UI/components/FlipCard"
import { Icon, IconSize } from "./../../../UI/Icon"

import * as Oni from "oni-api"

import { AchievementsManager, AchievementWithProgressInfo } from "./AchievementsManager"

export interface ITrophyCaseViewProps {
    achievements: AchievementsManager
}

export interface ITrophyCaseViewState {
    progressInfo: AchievementWithProgressInfo[]
}

export const TrophyCaseViewWrapper = withProps<{}>(styled.div)`
    background-color: ${p => p.theme.background};
    color: ${p => p.theme.foreground};
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;

    justify-content: flex-start;
`

export const TrophyCaseItemViewWrapper = withProps<{}>(styled.div)`
    ${boxShadow}
    background-color: ${p => p.theme["editor.background"]};
    margin: 1em;
    position: relative;

    display: flex;
    flex-direction: horizontal;
`

export const TrophyCaseBackground = styled.div`
    position: absolute;
    color: black;
    opacity: 0.1;
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;
`

export const TrophyItemIcon = styled.div`
    width: 48px;
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;

    padding: 1em;
    margin: 0.5em;
    background-color: rgba(0, 0, 0, 0.2);
    color: rgba(255, 255, 255, 0.5);
`

export const TitleText = styled.div`
    padding-bottom: 0.25em;
    font-weight: bold;
    opacity: 0.9;
`

export const DescriptionText = styled.div`
    font-size: 0.9em;
`

export interface ICenteredIconProps {
    isSuccess?: boolean
}

export const CenteredIcon = withProps<ICenteredIconProps>(styled.div)`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    ${p => (p.isSuccess ? "color: " + p.theme["highlight.mode.insert.background"] + ";" : "")}
`

export const TrophyCaseItemView = (props: {
    achievementInfo: AchievementWithProgressInfo
    dependentAchieventName?: string
}) => {
    const isLocked = !!props.dependentAchieventName

    const icon = (
        <FlipCard
            isFlipped={props.achievementInfo.completed}
            front={
                <CenteredIcon>
                    <Icon name="trophy" size={IconSize.ThreeX} />
                </CenteredIcon>
            }
            back={
                <CenteredIcon isSuccess={true}>
                    <Icon name="check" size={IconSize.ThreeX} />
                </CenteredIcon>
            }
        />
    )

    const lockedIcon = (
        <CenteredIcon>
            <Icon name="lock" size={IconSize.ThreeX} />
        </CenteredIcon>
    )

    const description = isLocked ? (
        <span>
            Complete the <Bold>{props.dependentAchieventName}</Bold> achievement to unlock
        </span>
    ) : (
        props.achievementInfo.achievement.description
    )

    return (
        <TrophyCaseItemViewWrapper>
            <Fixed>
                <TrophyItemIcon>{isLocked ? lockedIcon : icon}</TrophyItemIcon>
            </Fixed>
            <Full
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "1em",
                }}
            >
                <TitleText>{isLocked ? null : props.achievementInfo.achievement.name}</TitleText>
                <DescriptionText>{description}</DescriptionText>
            </Full>
        </TrophyCaseItemViewWrapper>
    )
}

export class TrophyCaseView extends React.PureComponent<
    ITrophyCaseViewProps,
    ITrophyCaseViewState
> {
    constructor(props: ITrophyCaseViewProps) {
        super(props)

        this.state = {
            progressInfo: props.achievements.getAchievements(),
        }
    }

    public render(): JSX.Element {
        const items = this.state.progressInfo.map(item => {
            let dependentAchievementName = null
            if (item.locked) {
                const dependentId = item.achievement.dependsOnId
                const dependentAchievement = this.state.progressInfo.find(
                    f => f.achievement.uniqueId === dependentId,
                )
                if (dependentAchievement) {
                    dependentAchievementName = dependentAchievement.achievement.name
                }
            }

            return (
                <TrophyCaseItemView
                    achievementInfo={item}
                    dependentAchieventName={dependentAchievementName}
                />
            )
        })
        return (
            <TrophyCaseViewWrapper>
                <TrophyCaseBackground>
                    <Icon name="trophy" size={IconSize.FiveX} style={{ fontSize: "20em" }} />
                </TrophyCaseBackground>
                <Fixed>
                    <BufferLayerHeader
                        title="Achievements"
                        description="Discover new functionality by unlocking achievements"
                    />
                </Fixed>
                <Full>{items}</Full>
            </TrophyCaseViewWrapper>
        )
    }
}

export class AchievementsBufferLayer implements Oni.BufferLayer {
    public get id(): string {
        return "oni.layer.achievements"
    }

    public get friendlyName(): string {
        return "Achievements"
    }

    constructor(private _achievements: AchievementsManager) {}

    public render(context: Oni.BufferLayerRenderContext): JSX.Element {
        return <TrophyCaseView achievements={this._achievements} />
    }
}
