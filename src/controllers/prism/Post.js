const core = require('gls-core-service');
const Content = core.utils.Content;
const AbstractContent = require('./AbstractContent');
const PostModel = require('../../models/Post');

class Post extends AbstractContent {
    constructor(...args) {
        super(...args);

        this._contentUtil = new Content();
    }

    async handleCreate(content, { communityId, blockTime }) {
        if (!(await this._isPost(content))) {
            return;
        }

        const contentId = this._extractContentId(content);

        const model = await PostModel.create({
            communityId,
            contentId,
            content: await this._extractContentObject(content),
            meta: {
                time: blockTime,
            },
            payout: {
                meta: {
                    tokenProp: Number(content.tokenprop),
                    benefactorPercents: this._extractBenefactorPercents(content),
                },
            },
        });

        await this.registerForkChanges({ type: 'create', Model: PostModel, documentId: model._id });
        await this.updateUserPostsCount(contentId.userId, 1);
    }

    async handleUpdate(content) {
        if (!(await this._isPost(content))) {
            return;
        }

        const previousModel = await PostModel.findOneAndUpdate(
            {
                contentId: this._extractContentId(content),
            },
            {
                $set: {
                    content: await this._extractContentObject(content),
                },
            }
        );

        if (previousModel) {
            await this.registerForkChanges({
                type: 'update',
                Model: PostModel,
                documentId: previousModel._id,
                data: {
                    $set: {
                        content: previousModel.content,
                    },
                },
            });
        }
    }

    async handleDelete(content) {
        if (!(await this._isPost(content))) {
            return;
        }

        const contentId = this._extractContentId(content);
        const previousModel = await PostModel.findOneAndRemove({ contentId });

        await this.registerForkChanges({
            type: 'remove',
            Model: PostModel,
            documentId: previousModel._id,
        });
        await this.updateUserPostsCount(contentId.userId, -1);
    }

    async handleRepost({ rebloger: userId, ...content }, { communityId, blockTime }) {
        const model = await PostModel.create({
            communityId,
            contentId: this._extractContentId(content),
            repost: {
                isRepost: true,
                userId,
                body: {
                    raw: this._extractBodyRaw(content),
                },
            },
            meta: {
                time: blockTime,
            },
        });

        await this.registerForkChanges({ type: 'create', model: PostModel, documentId: model._id });
    }
}

module.exports = Post;
