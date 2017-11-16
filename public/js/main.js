$(document).ready(function(){
	$('.deleteUser').on('click', deleteUser);	
});


function deleteUser(){
	var confirmation = confirm('Are you sure?');
	if(confirmation){
		$.ajax({
			type:'DELETE',
			url: '/users/delete/' + $(this).data('id')
		}).done(function(response){
			//this one is not work.
			alert("done");
			//window.location.replace('/');
		});
			window.location.replace('/');
	}else{
		return false;
	}
}
