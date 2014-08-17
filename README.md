### forgetsy-js-api

The beginning of a trending API using [forgetsy-js](https://github.com/kirk7880/forgetsy-js) library. This is not production ready and a first iteration at creating an API to track temporal trends in a non-stationary, categorial distribtion. 


### API Actions

<table>
	<tr>
		<td><b>Action</b></td>
		<td><b>Description</b></td>
	</tr>
	<tr>
		<td>Create</td>
		<td>Creates a new distribtion</td>
	</tr>

	<tr>
		<td>Increment</td>
		<td>Increments a bin</td>
	</tr>

	<tr>
		<td>Fetch</td>
		<td>Fetches a distribution or specific bin in a distribtion</td>
	</tr>
</table>

#### Create Options
<table>
	<tr>
		<td><b>Options</b></td>
		<td><b>Description</b></td>
	</tr>
	<tr>
		<td>categories</td>
		<td>
			Create one or more distribution (/create?categories=cat1,cat2,...)
			<br/><br/>
			Distribtuions are buckets to trend items in. Let's say you run a video<br/>
			streaming service. A video may be classified as action-comedy or <br/>
			action-drama, etc. <br/>
			<br/>
			You could create two distribtuions:<br/>
			(/create?categories=action,comedy&type=video)
			<br/>
			When someone watch a video that is action-comedy, you can increment the bin <br/>
			for that item (/incr?categories=action,drama&type=video&bin=item_id) where <br/>
			item id uniquely identifies the video being viewed. 
		</td>
	</tr>

	<tr>
		<td>type</td>
		<td>Each distribtion should be of a specific type; video or article, for example.</td>
	</tr>
</table>


