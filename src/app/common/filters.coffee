angular.module("doubtfire.filters", [  ])

#
# Paging filter - start from the indicated index
#
.filter('startFrom', ->
  (input, start) ->
    start = +start # parse to int
    if input
      input.slice(start)
    else
      input
)

.filter('showStudents', ->
  (input, kind, tutorName) ->
    if input
      if kind == "myStudents"
        _.where  input, { tutorial: {tutor_name: tutorName} }
      else
        input
    else
      input
)

.filter('orderObjectBy', ->
  (items, field, reverse) ->
    filtered = []
    
    angular.forEach items, (item) ->
      filtered.push(item)
    
    filtered.sort (a, b) ->
      a[field] > b[field] ? 1 : -1

    if reverse
      filtered.reverse()
    
    filtered
)
