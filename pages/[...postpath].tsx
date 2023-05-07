import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const referringURL = ctx.req.headers?.referer || null;
	const pathArr = ctx.query.postpath as Array<string>;
	const path = pathArr.join('/');
	console.log(path);
	const fbclid = ctx.query.fbclid;

	// redirect if facebook is the referer or request contains fbclid
	if (referringURL?.includes('facebook.com') || fbclid) {
		return {
			redirect: {
				permanent: false,
				destination: `https://dailytrendings.info${encodeURI(path as string)}`,
			},
		};
	}

	try {
		const response = await fetch(`https://dailytrendings.info/wp-json/wp/v2/posts?slug=${path}&_embed`);
		const data = await response.json();
		if (data.length === 0) {
			return {
				notFound: true,
			};
		}
		return {
			props: {
				path,
				post: data[0],
				host: ctx.req.headers.host,
			},
		};
	} catch (error) {
		console.error(error);
		return {
			notFound: true,
		};
	}
};

interface PostProps {
	post: any;
	host: string;
	path: string;
}

const Post: React.FC<PostProps> = (props) => {
	const { post, host, path } = props;

	return (
		<>
			<Head>
				<meta property="og:title" content={post.title.rendered} />
				<link rel="canonical" href={`https://${host}/${path}`} />
				<meta property="og:description" content={post.excerpt.rendered} />
				<meta property="og:url" content={`https://${host}/${path}`} />
				<meta property="og:type" content="article" />
				<meta property="og:locale" content="en_US" />
				<meta property="og:site_name" content={host.split('.')[0]} />
				<meta property="article:published_time" content={post.date} />
				<meta property="article:modified_time" content={post.modified} />
				<meta property="og:image" content={post._embedded['wp:featuredmedia'][0].source_url} />
				<meta
					property="og:image:alt"
					content={post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered}
				/>
				<title>{post.title.rendered}</title>
			</Head>
			<div className="post-container">
				<h1>{post.title.rendered}</h1>
				<img
					src={post._embedded['wp:featuredmedia'][0].source_url}
					alt={post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered}
				/>
				<article dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
			</div>
		</>
	);
};

export default Post;
