# Reverse Doubl Linkedin List

# class Node:
#     def __init__(self, data, next_node=None, back_node=None):
#         # Data stored in the node
#         self.data = data
#         # Reference to the next node
#         # in the list (forward direction)
#         self.next = next_node
#         # Reference to the previous node
#         # in the list (backward direction)
#         self.back = back_node


# def print_dll(head):
#     while head is not None:
#         # Print the data in the current node
#         print(f"{head.data} <->", end=" ")
#         # Move to the next node
#         head = head.next
#     print()


# def convert_arr_to_dll(arr):
#     # Create the head node with
#     # the first element of the array
#     head = Node(arr[0])
#     # Initialize 'prev' to the head node
#     prev = head

#     for i in range(1, len(arr)):
#         # Create a new node with data from the
#         # array and set its 'back' pointer
#         # to the previous node
#         temp = Node(arr[i], None, prev)

#         # Update the 'next' pointer of the
#         # previous node to point to the new node
#         prev.next = temp
#         # Move 'prev' to the newly created
#         # node for the next iteration
#         prev = temp

#     # Return the head of the doubly linked list
#     return head


# def reverse_dll(head):
#     stack = []

#     current_head = head
#     while current_head:
#         stack.append(current_head.data)
#         current_head = current_head.next

#     revers_head = head
#     while stack:
#         revers_head.data = stack.pop()
#         revers_head = revers_head.next
#     return head


# arr = [12, 5, 6, 8, 4]
# # Convert the array to a
# # doubly linked list
# head = convert_arr_to_dll(arr)
# head = reverse_dll(head)
# print_dll(head)


# def temratrure()


# from collections import defaultdict

# arr = [[1, 0], [2, 0], [3, 1], [3, 2]]

# graph = defaultdict(list)

# for a, b in arr:
#     graph[a].append(b)
# print(graph)


# vis = set()
# ans = []


# def dfs(course):
#     vis.add(course)
#     for dependes in graph[course]:
#         if dependes not in vis:
#             dfs(dependes)
#     ans.append(course)


# all_courses = set()
# for course in arr:
#     all_courses.add(course[0])
#     all_courses.add(course[1])

# for course in all_courses:
#     if course not in vis:
#         dfs(course)

# print(ans)


# def fourSum(nums, target):
#     nums.sort()

#     ans = set()
#     for i in range(len(nums)):
#         sum_arr = []
#         left = i
#         right = len(nums) - 1
#         print(f"{left} | {right}")
#         while left < right:
#             if len(sum_arr) == 4 and sum_arr == target:
#                 ans.add(sum_arr)
#                 continue

#             sum_arr.append(nums[left])
#             print(f"Sums : {sum_arr}")
#             if sum(sum_arr) < target:
#                 left += 1
#             else:
#                 right -= 1

#     return ans


# nums = [1, 0, -1, 0, -2, 2]
# target = 0
# fourSum(nums, target=target)


# class LRUCache:
#     def __init__(self, capacity: int):
#         self.capacity = capacity
#         self.lru = {}
#         self.recent_key = None

#     def get(self, key: int) -> int:
#         if key in self.lru:
#             self.recent_key = key
#             return self.lru[key]
#         else:
#             return -1

#     def put(self, key: int, value: int) -> None:
#         if len(self.lru) > self.capacity:
#             del self.lru[self.recent_key]
#         self.lru[key] = value


# Your LRUCache object will be instantiated and called as such:
# obj = LRUCache(capacity)
# param_1 = obj.get(key)
# obj.put(key,value)


# import collections
# from typing_extensions import OrderedDict

# temp = OrderedDict()
# for i in range(1, 5):
#     temp[i] = i

# print(temp)
# temp.move_to_end(2)
# print(f"After Moving: {temp}")
# print(temp.popitem(last=False))


class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []

    def push(self, val: int):
        self.stack.append(val)
        if not self.min_stack or val <= self.min_stack[-1]:
            self.min_stack.append(val)
        else:
            self.min_stack.append(self.min_stack[-1])

    def pop(self):
        self.stack.pop()
        self.min_stack.pop()

    def top(self):
        return self.stack[-1]

    def getMin(self):
        return self.min_stack[-1]


# Your MinStack object will be instantiated and called as such:
# obj = MinStack()
# obj.push(val)
# obj.pop()
# param_3 = obj.top()
# param_4 = obj.getMin()
