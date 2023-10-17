import { Agent, InitConfig } from '@aries-framework/core'
import { agentDependencies } from '@aries-framework/node'
import { AskarModule } from '@aries-framework/askar'
import { ariesAskar } from '@hyperledger/aries-askar-nodejs'
import {
    IndyVdrAnonCredsRegistry,
    IndyVdrModule,
} from '@aries-framework/indy-vdr'
import { indyVdr } from '@hyperledger/indy-vdr-nodejs'
import { AnonCredsModule } from '@aries-framework/anoncreds'
import { AnonCredsRsModule } from '@aries-framework/anoncreds-rs'
import { anoncreds } from '@hyperledger/anoncreds-nodejs'
import * as ledgers from '../ledgers.json'
import * as tests from '../tests.json'

const run = async () => {
    const config: InitConfig = {
        label: 'afj-test',
        walletConfig: {
            id: 'afj-wallet',
            key: 'testkey0000000000000000000000000',
        },
    }

    const agent = new Agent({
        config,
        dependencies: agentDependencies,
        modules: {
            // Register the Askar module on the agent
            // We do this to have access to a wallet
            askar: new AskarModule({
                ariesAskar,
            }),
            anoncredsRs: new AnonCredsRsModule({
                anoncreds,
            }),
            indyVdr: new IndyVdrModule({
                indyVdr,
                networks: [...(ledgers as any).genesis.map((net: any) => { return { isProduction: false, indyNamespace: net.indyNamespace, genesisTransactions: net.genesisTransactions, connectOnStartup: true } })] as [any, ...any[]]
            }),
            anoncreds: new AnonCredsModule({
                registries: [new IndyVdrAnonCredsRegistry()],
            })
        },
    })


    await agent.initialize().then(_ => { console.log("AFJ Agent initialized") }).catch((e) => console.log(`Agent initialization failed with error ${e}`))

    interface defItem {
        label: string,
        id: string
    }

    for (const key of Object.keys(tests)) {
        const test = (tests as any)[key]
        if (key === 'default') {
            return
        }
        console.log(`Running test ${key}:`)
        const schemas: defItem[] | undefined = test.schemas
        console.log("\ttesting schemas:")
        if (schemas) {
            for (const schema of schemas) {
                console.log(`\t\ttesting schema ${schema.id} (${schema.label}):`)
                const schemaCommandStart = Date.now()
                await agent.modules.anoncreds.getSchema(schema.id)
                const schemaCommandEnd = Date.now()

                console.log(`\t\tFetched schema in ${(schemaCommandEnd - schemaCommandStart) / 1000} seconds\n`)
            }
        }

        const credDefs: defItem[] | undefined = test.credDefs
        console.log("\ttesting credential definitions:")
        if (credDefs) {
            for (const credDef of credDefs) {
                console.log(`\t\ttesting credential definition ${credDef.id} (${credDef.label}):`)
                const credDefCommandStart = Date.now()
                await agent.modules.anoncreds.getCredentialDefinition(credDef.id)
                const credDefCommandEnd = Date.now()

                console.log(`\t\tFetched credential definition id in ${(credDefCommandEnd - credDefCommandStart) / 1000} seconds\n`)
            }
        }

        const revRegDefs: defItem[] | undefined = test.revocRegDef
        console.log("\ttesting revocation registry definitions:")
        if (revRegDefs) {
            for (const revRegDef of revRegDefs) {
                console.log(`\t\ttesting credential definition ${revRegDef.id} (${revRegDef.label}):`)
                const revRegCommandStart = Date.now()
                agent.modules.anoncreds.getRevocationRegistryDefinition(revRegDef.id)
                const revRegCommandEnd = Date.now()

                console.log(`\t\tFetched revocation registry in ${(revRegCommandEnd - revRegCommandStart) / 1000} seconds\n`)
            }
        }
    }
    process.exit(0)
}

run()
