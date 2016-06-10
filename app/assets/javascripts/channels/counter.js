// app/assets/javascripts/channels/counter.js

//= require cable
//= require_tree .

this.App = {};

App.cable = ActionCable.createConsumer();

App.messages = App.cable.subscriptions.create('MessagesChannel', {
  received: function(data) {
    $("#messages").removeClass('hidden');

    return $('#messages').append(this.renderLocation(data));
  },

  renderLocation: function(data) {
    return "<p><b>" + data.lat + ":" + data.long + "</b></p>";
  }
});