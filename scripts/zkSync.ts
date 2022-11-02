import * as dotenv from 'dotenv'
import { ethers } from 'ethers'
import * as zksync from 'zksync-web3'

dotenv.config()

const PRIVATE_KEY = process.env.PRIVATE_KEY || ''
const AMOUNT = process.env.AMOUNT || '0.001'
const TO = process.env.TO || ''
const TX_COUNT = process.env.TX_COUNT || '61'

interface TransferInfo {
  to: string
  amount: ethers.BigNumberish
  token?: string
}

async function main() {
  const syncProvider = new zksync.Provider('https://zksync2-testnet.zksync.dev')

  const ethProvider = ethers.getDefaultProvider('goerli')

  const syncWallet = new zksync.Wallet(PRIVATE_KEY, syncProvider, ethProvider)

  const balanceTx = await syncWallet.getBalance()
  console.log('>>>>>Before transfer', ethers.utils.formatEther(balanceTx))

  for (let i = 0; i < parseInt(TX_COUNT); i++) {
    await transfer(syncWallet, TO)
  }

  const afterBalanceTx = await syncWallet.getBalance()
  console.log('>>>>>After transfer', ethers.utils.formatEther(afterBalanceTx))
}

async function transfer(from: zksync.Wallet, to: string) {
  const amount = ethers.utils.parseEther(AMOUNT)

  const tx = await from.transfer({
    to,
    amount,
  })
  const receipt = await tx.wait()
  console.log('>>>>>>receipt,', to, receipt.transactionHash)
}

main()
  .then(() => process.exit(0))
  .catch((error: any) => {
    console.error(error)
    process.exit(1)
  })
