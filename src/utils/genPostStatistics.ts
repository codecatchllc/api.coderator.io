import { PostModel } from '../@types/custom';

export default function genPostStatistics(posts: PostModel[]) {
    const languageCounts = new Map();

    posts.map(post => {
        const languageCount = languageCounts.get(post.language) || 0;
        languageCounts.set(post.language, languageCount + 1);
    });

    return Array.from(
        new Map([...languageCounts.entries()].sort((a, b) => b[1] - a[1]))
    );
}