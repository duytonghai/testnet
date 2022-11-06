import * as dotenv from 'dotenv'
import { ethers } from 'ethers'
import * as zksync from 'zksync-web3'

dotenv.config()

const PRIVATE_KEY = process.env.PRIVATE_KEY || ''
const TOKEN = process.env.TOKEN || '0x0000000000000000000000000000000000000000' // ETH
const AMOUNT = process.env.AMOUNT || '0.1'
const NETWORK_PROVIDER =  process.env.NETWORK_PROVIDER || 'goerli'

async function main() {
  const syncProvider = new zksync.Provider('https://zksync2-testnet.zksync.dev')
  const ethProvider = ethers.getDefaultProvider(NETWORK_PROVIDER)
  const syncWallet = new zksync.Wallet(PRIVATE_KEY, syncProvider, ethProvider)

  console.log('Starting deposit...')

  const tx = await syncWallet.deposit({
    token: TOKEN,
    amount: ethers.utils.parseEther(AMOUNT),
  })
  await tx.waitL1Commit()
  const receipt = await tx.wait()

  console.log('>>>>>After deposited', receipt.transactionHash)
}

main()
  .then(() => process.exit(0))
  .catch((error: any) => {
    console.error(error)
    process.exit(1)
  })
