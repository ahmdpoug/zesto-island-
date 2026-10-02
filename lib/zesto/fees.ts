import { ZESTO_DECIMALS } from './config'
import { TOOL_BY_ID, type ToolId } from './economy'
import type { GameAction } from './game-types'

export const FEES = {
  gather: 5,
  build: 150,
  upgradePerLevel: 100,
  smeltPerBatch: 10,
  craftPerTier: 50,
  collect: 10,
} as const

export function buildingFee(targetLevel: number) {
  return targetLevel <= 1 ? FEES.build : FEES.upgradePerLevel * targetLevel
}

export function smeltFee(times: number) {
  return FEES.smeltPerBatch * times
}

export function craftFee(tool: ToolId) {
  return FEES.craftPerTier * TOOL_BY_ID[tool].tier
}

/** `currentLevel` is the building's level before the action; only used for upgrades. */
export function actionFee(action: GameAction, currentLevel = 0): number {
  switch (action.type) {
    case 'gather':
      return FEES.gather
    case 'build':
      return buildingFee(1)
    case 'upgrade':
      return buildingFee(currentLevel + 1)
    case 'smelt':
      return smeltFee(action.times)
    case 'craft':
      return craftFee(action.tool)
    case 'collect':
      return FEES.collect
    default:
      return 0
  }
}

export function zestoToWei(amount: number) {
  return BigInt(`${amount}${"0".repeat(ZESTO_DECIMALS)}`)
}
