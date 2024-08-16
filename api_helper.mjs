import moment from 'moment';

export async function fetchData(url) {
	try {
		const headers = { 'Authorization': `Bearer ${process.env.GITHUB_PAT}` };
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
    }
}

export async function getAllPRs(repository) {
   const url = `https://api.github.com/repos/SonarSource/${repository}/pulls?state=all`;
   return fetchData(url);
}

export async function getPrsMergeTimes(repository, startDate, endDate) {
	const url = `https://api.github.com/repos/SonarSource/${repository}/pulls?state=closed&base=master&per_page=100`;
	const allClosedPrs = await fetchData(url);
	const mergedPrsInTimeFrame = allClosedPrs.filter(pr =>  pr.merged_at !== null
		 && moment(pr.created_at).isAfter(moment(startDate))
		  && moment(pr.created_at).isBefore(moment(endDate)));

	const prMergeTimes = [];
	await Promise.all(mergedPrsInTimeFrame.map(async (pr) => {
		const createdAt = moment(pr.created_at);
		const closedAt = moment(pr.closed_at);
		const duration = moment.duration(closedAt.diff(createdAt));
		prMergeTimes.push(duration.asHours());
	}));
	return prMergeTimes;
}