import db from "../../db.server";
import { BLOCK_REGISTRY } from "../blocks/registry";

export async function seedAppBlocks(session) {
    const blockTypes = Object.keys(BLOCK_REGISTRY);

    await db.$transaction(
        blockTypes.map((blockType, index) =>
            db.appBlock.upsert({
                where: {
                    sessionId_blockType: {
                        sessionId: session.id,
                        blockType,
                    },
                },
                update: {}, // never overwrite an existing config/enabled/position on re-seed
                create: {
                    sessionId: session.id,
                    shop: session.shop,
                    blockType,
                    enabled: false,
                    position: index,
                    config: BLOCK_REGISTRY[blockType].defaultConfig,
                },
            }),
        ),
    );
}