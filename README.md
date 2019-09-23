<link rel="stylesheet" href="popup.css">

1. [Introduction](#introduction)
2. [Model and Untimed Verification](#untimed)
3. [Timed Properties](#timed)
   1. [Revision 0](#revision0)
   2. [Revision 1](#revision1)
4. [Simulation Verification](#simver)

# <a name="introduction"></a>Introduction

This report documents the development of the model of a single robot in a swarm acting under the Alpha Algorithm. Chapter 1
presents our model of the Alpha Algorithm implemented in a single robot, and presents the results of the verification of 
the requirements described below. Chapter 2 presents results of the verification using the timed RoboChart model of the 
Alpha Algorithm, considering both the requirements described below as well as requirements regarding timed properties.

As a basis for verification, we define below a few requirements for the alpha algorithm restricted to a single 
robot. The basic requirements are core properties. The model requirements are specific of the application. We 
encode them as CSP processes, which refer to elements of the semantics of the RoboChart model we present below.
Only those interested in understanding the formal description of the semantics need to read these process definitions. 

#### A\) Basic Requirements

##### 1\) Communication behaviour is deterministic.
```
assertion a1: Communication is deterministic
```
##### 2\) Communication behaviour is divergence free.
```
assertion a2: Communication is divergence-free
```
##### 3\) Communication behaviour is deadlock free.
```
assertion a3: Communication is deadlock-free
```
##### 4\) Movement behaviour is nondeterministic.
```
assertion a4: Movement is not deterministic
```
##### 5\) Movement behaviour is divergence free.
```
assertion a5: Movement is divergence-free
```
##### 6\) Movement behaviour is deadlock free.
```
assertion a6: Movement is deadlock-free
```
##### 7\) The overall model is nondeterministic.
```
assertion a7: AggregationSoftware is not deterministic
```
##### 8\) The overall model is divergence free.
```
assertion a8: AggregationSoftware is divergence-free
```
##### 9\) The overall model is deadlock free.
```
assertion a9: AggregationSoftware is deadlock-free
```


#### B\) Model Requirements

##### 1\) The communication behaviour should consist of a broadcast followed by a receive event.

In particular, if the robot broadcasts its identifier through `broadcast`, zero or more occurrences of `receive`, whose first 
element of the parameter is that identifier, occur; these are the responses from the neighbours. While the robot receives
responses from neighbours, it also can receive a broadcast from another robot, which is followed by a `receive` event, 
whose parameter contains the parameter of the `broadcast` as first element, and the identifier of the robot as the second element.

```
csp Spec1 csp-begin
Spec1 = let
Responds = (|~|x:ID @ AggregationSoftware_receive.in.(Communication_id,x) -> Responds) |~| SKIP
Run = AggregationSoftware_broadcast.in?x:diff(ID,{Communication_id}) -> AggregationSoftware_receive.out!(x,Communication_id) -> Run |~| SKIP
Main = AggregationSoftware_broadcast.out.Communication_id -> (Responds|||Run); Main
within
Main
csp-end

csp Impl1 csp-begin
Impl1 = AggregationSoftware_O(0)\diff(Events,{|AggregationSoftware_receive,AggregationSoftware_broadcast|})
csp-end

assertion b1: Impl1 refines Spec1 in the failures model
```


##### 2\) The robot should start moving, and, after every obstacle, move at least once.

```
csp Spec2 csp-begin
Spec2 = let
Moves = moveCall -> moveRet -> (Moves |~| SKIP)
Run = |~|x:Position @ AggregationSoftware_obstacle.in.x -> Moves; Run
within
Moves; Run
csp-end 

csp Impl2 csp-begin
Impl2 = AggregationSoftware_O(0)\diff(Events,{|moveCall,moveRet,AggregationSoftware_obstacle|})
csp-end

assertion b2: Impl2 refines Spec2 in the failures model
```

# <a name="untimed"></a>Model and Untimed Verification ([download](AlphaAlgorithm_v5.0.zip))

The model for the Alpha Algorithm shown below is very simple as is common in swarm algorithms. The Alpha-Algorithm 
state machines have timed cyclic behaviours defined using clocks. The robot is required to: turn after every `MB` time units, 
and probe for information from its neighbours after every `RC` time units. The value of these constants is left undefined in 
the RoboChart model, and so for a particular system they need to be instantiated. In particular, because of the interaction 
between the state machines their values need to be chosen so that overall the system can satisfy both cyclic periods.

These cyclic behaviours are specified in the state machines `Movement` and `Communication` through the use of clocks and 
appropriate timed conditions. For example, in the case of the state machine `Movement`, the state `Turning` is entered
after `MB` time units \(specified by the condition `since(MBC)>=MB` on the transition from `MovementAndAvoidance` to 
`Turning`\). Similarly, in the state machine `Communication`, the state `Receive` is entered after every `RC` time units
\(specified by the condition `since(RCC)>=RC` between the states `Receive` and `Broadcast`\).

Most of the requirements are established easily by FDR, except A.1 which states that the communication behaviour is deterministic. This fails because in 
the state `Receive`, the transition guarded by `[since(RCC) >= RC]` \(once it becomes enabled\) introduces a nondeterminism. 
Since this transition does not have a trigger, if any of the events that trigger another transition from `Receive` occur, 
then either that transition of the one guarded by `[since(RCC) >= RC]` can take place. 

The model can be altered to satisfy this requirement by conditioning all competing transitions with `[since(RCC)<RC]`. 
While the requirement still cannot be verified in the untimed model, in the timed model we are able to prove it. This is 
discussed in the next chapter, where we present an alternative model with the extra guards. 

Absence of timed guards on transitions are also why requirements A.5 and A.7 are verified successfully. However, further review of the 
model and its semantics uncovers that the `random()` function does not introduce nondeterminism. This is due to the fact that 
the CSP semantics of RoboChart does not support the definition of nondeterministic functions such as `random()`.

This limitation can be overcome by modifying the CSP model directly, and extracting the nondeterminism from the function 
call and distributing it over the statement. For instance, the statement `x = random()` can be defined as `|~|i:real @ x = i`,
provided that the output  type of `random` is `real` and that in the model `real` is instantiated as a finite set. We do not
pursue this option here. 

In this particular model, nondeterminism should only arise from the use of `random()` as a parameter to `wait`.
This can be addressed using the timed semantics of RoboChat, which is the object of the next chapter. 

### Model

<div class="flex-container">
<popup-fig title="AggregationSw" src="img/AggregationSw.jpg">
</popup-fig>

<popup-fig title="MovementC" src="img/movementC.jpg">
</popup-fig>

<popup-fig title="Aggregation" src="img/aggregation.jpg">
</popup-fig>

<popup-fig title="CommunicationC" src="img/communicationC.jpg">
</popup-fig>

<popup-fig title="Communication" src="img/communication.jpg">
</popup-fig>

<popup-fig title="Mathematics" src="img/Mathematics.jpg">
</popup-fig>
</div>

### Analysis

| Requirement | Result |
| :--- | :--- |
| A.1 `CommunicationC` is deterministic | **false** |
| A.2 `CommunicationC` is divergence free | true |
| A.3 `CommunicationC` is deadlock free | true |
| A.4 `MovementC` is nondeterministic | true |
| A.5 `MovementC` is divergence free | true |
| A.6 `MovementC` is deadlock free | true |
| A.7 `AggregationSoftware_O` is nondeterministic | true |
| A.8 `AggregationSoftware_O` is divergence free | true |
| A.9 `AggregationSoftware_O` is deadlock free | true |
| B.1 `AggregationSoftware_O` refines `Spec1` | true |
| B.2 `AggregationSoftware_O` refines `Spec2` | true |

# <a name="timed"></a>Timed Properties

In this chapter we address the limitations of the analysis discussed in the previous chapter by analysing the 
Alpha-Algorithm specification using the `tock-CSP` model derived from the RoboChart specification. In addition, we consider some additional requirements related to time.

### TA\) Basic Timed Requirements

To cater for the extra requirements, we define `tock-CSP`processes. Like the processes above, they refer to elements
of the semantics of the RoboChart model. Only those interested in understanding the formal description of the timed 
semantics need to read these process definitions. 

In the semantics, we have a process `T_Movement_VS`, where the internal events `Movement_enteredV`,
`Movement_enterV`, and `Movement_exitV` are visible. These events record when a state of the `Movement` state 
machine is beginning to enter, has entered, and is being exited, respectively. The semantics also defines a 
corresponding  process `T_Communication_VS` for the state machine`Communication`, where the events 
`Communication_enterV` and`Communication_exitV` are made visible. Similarly,`AggregationSoftware_VS` makes 
those events visible for the whole robotic system. Untimed versions of these processes are similarly defined
without the prefix `T_`. The `tock-CSP` processes without the internal events visible are defined as: `T_Movement`, `T_Communication` and `T_AggregationSoftware`, respectively.

#### 1\) There are no timelocks.

To check this property we define the following auxiliary sets of events visible for the state machines and the whole
robot.

```
TA_ExternalEvents_Movement = {|Movement_obstacle,Movement_neighbours|}
TA_ExternalEvents_Communication = {|Communication_receive,Communication_robots|}
TA_ExternalEvents_AggregationSoftware = {|obstacle,receive|}
```

Absence of timelocks corresponds to not refusing `tock` events at any point, whereas other externally visible events can be 
performed or refused arbitrarily. For example, for the overall Alpha Algorithm module, we check this property by considering 
the refinement between: the parallel composition in interleaving of `RUN({tock})`, which offers `tock` forever, and `CHAOS(TA_ExternalEvents_AggregationSoftware)`, 
which may or may not refuse events in the set `TA_ExternalEvents_AggregationSoftware` forever, and the process `T_AggregationSoftware |\ union(TA_ExternalEvents_AggregationSoftware,{tock})` where every event other than `tock` and those in the set `TA_ExternalEvents_AggregationSoftware` are hidden using `|\`.

```
-- Requirement TA.1
assert RUN({tock}) ||| CHAOS(TA_ExternalEvents_Movement) [F= T_Movement |\ union(TA_ExternalEvents_Movement,{tock})
assert RUN({tock}) ||| CHAOS(TA_ExternalEvents_Communication) [F= T_Communication |\ union(TA_ExternalEvents_Communication,{tock})
assert RUN({tock}) ||| CHAOS(TA_ExternalEvents_AggregationSoftware) [F= T_AggregationSoftware |\ union(TA_ExternalEvents_AggregationSoftware,{tock})
```

#### 2\) Every state is reachable.

```
-- Requirement TA.2
assert not STOP [T= T_AggregationSoftware_VS |\ {|Movement_enteredV."Movement_Turning_Turn180"|}
assert not STOP [T= T_AggregationSoftware_VS |\ {|Movement_enteredV."Movement_Turning_RandomTurn"|}
assert not STOP [T= T_AggregationSoftware_VS |\ {|Movement_enteredV."Movement_Turning_f1"|}
assert not STOP [T= T_AggregationSoftware_VS |\ {|Movement_enteredV."Movement_Turning"|}
assert not STOP [T= T_AggregationSoftware_VS |\ {|Movement_enteredV."Movement_MovementAndAvoidance"|}
assert not STOP [T= T_AggregationSoftware_VS |\ {|Movement_enteredV."Movement_MovementAndAvoidance_Move"|}
assert not STOP [T= T_AggregationSoftware_VS |\ {|Movement_enteredV."Movement_MovementAndAvoidance_Avoid"|}
assert not STOP [T= T_AggregationSoftware_VS |\ {|Communication_enteredV."Communication_Broadcast"|}
assert not STOP [T= T_AggregationSoftware_VS |\ {|Communication_enteredV."Communication_Receive"|}
```

#### 3\) States can be visited infinitely many times.

In the following assertions we check that every state can be entered forever. For example, in the case of the state 
`Turn180` we check that when considering the process `T_AggregationSoftware_VS` modelling the overall module with the  
`Movement_enteredV."Movement_Turning_Turn180"` event visible and no other, then it is refined by 
`RUN({|Movement_enteredV."Movement_Turning_Turn180"|})`, which continuously offers the event 
`Movement_enteredV."Movement_Turning_Turn180"`.

```
-- Requirement TA.3
assert T_AggregationSoftware_VS |\ {|Movement_enteredV."Movement_Turning_Turn180"|}
[T= RUN({|Movement_enteredV."Movement_Turning_Turn180"|})
assert T_AggregationSoftware_VS |\ {|Movement_enteredV."Movement_Turning_RandomTurn"|}
[T= RUN({|Movement_enteredV."Movement_Turning_RandomTurn"|})
assert T_AggregationSoftware_VS |\ {|Movement_enteredV."Movement_Turning_f1"|}
[T= RUN({|Movement_enteredV."Movement_Turning_f1"|})
assert T_AggregationSoftware_VS |\ {|Movement_enteredV."Movement_Turning"|}
[T= RUN({|Movement_enteredV."Movement_Turning"|})
assert T_AggregationSoftware_VS |\ {|Movement_enteredV."Movement_MovementAndAvoidance"|}
[T= RUN({|Movement_enteredV."Movement_MovementAndAvoidance"|})
assert T_AggregationSoftware_VS |\ {|Movement_enteredV."Movement_MovementAndAvoidance_Move"|}
[T= RUN({|Movement_enteredV."Movement_MovementAndAvoidance_Move"|})
assert T_AggregationSoftware_VS |\ {|Movement_enteredV."Movement_MovementAndAvoidance_Avoid"|}
[T= RUN({|Movement_enteredV."Movement_MovementAndAvoidance_Avoid"|})
assert T_AggregationSoftware_VS |\ {|Communication_enteredV."Communication_Broadcast"|}
[T= RUN({|Communication_enteredV."Communication_Broadcast"|})
assert T_AggregationSoftware_VS |\ {|Communication_enteredV."Communication_Receive"|}
[T= RUN({|Communication_enteredV."Communication_Receive"|})
```

##### 4\) The system does not initiate an infinite number of events within a finite time. \(Zeno freedom\)

```
-- Requirement TA.4
assert T_AggregationSoftware |\ union(ExternalEvents_AggregationSoftware,{tock}) :[divergence free]
```

### TB\) Timed Model Requirements

#### 1\) No more than `RC` continuous time units are spent in the state `Receive` of the state-machine `Communication`.

Since the cyclic behaviour of the state machine `Communication` is specified by the period `RC`, we capture the maximum time allowed in the state `Receive` by defining the following `tock-CSP` process `CommunicationStateSpent(t,x)`, where `t` is a parameter that we can vary to analyse the system, and `x` is the unique name of the state being considered.

```
CommunicationStateSpent(t,x) =
let
	Main = AnyOther({|Communication_enterV.x|}) ; ADeadline({|Communication_exitV.x|},t) ; Main
within
	timed_priority(Main)
```

This process first accepts any event nondeterministically using `AnyOther(E) = CHAOS(Events) [|E|> SKIP`, but once the event 
`Communication_enterV.x` occurs, then it requires that the event `Communication_exitV.x` must take place within `t` time units. 
This deadline is encoded using the process `ADeadline(E,d) = (CHAOS(Events) [| {tock} |] WAIT(d)) [|E|> SKIP`, which allows 
any event to happen nondeterministically within `d` time units, but after that an event in the set `E` must take place before 
time can pass. On the other hand, as soon as some event in `E` takes place, `ADeadline(E,d)` terminates. Finally there is a recursion. The overall process is defined by applying `timed\_priority` to `Main`, which ensures that maximal progress, that is, every internal event is performed before time can pass, is achieved in the `tock-CSP` encoding.

In our case, since the timed condition between `Receive` and `Broadcast` is `since(RCC)>=RC`, we specify through the following 
assertion that no more than `Communication_RC` time units are spent in state `"Communication_Receive"`. We observe that in 
the `CSP` model of RoboChart, variables and constants are uniquely identified together with the name of the state machine where they are declared, hence constant `RC` is actually uniquely defined as `Communication_RC`.

```
-- Requirement TB.1
assert 	CommunicationStateSpent(Communication_RC,"Communication_Receive")
		[FD=
		T_AggregationSoftware_VS
```

#### 2\) The state machine `Communication` starts to enter the state `Receive` exactly every `RC` units.

```
EnterExactly(t) = 
	let
		Initial = ADeadline({|Communication_enterV."Communication_Receive"|},0)
		EveryT = ADeadline({|Communication_enterV."Communication_Receive"|},t) ; EveryT
	within
		timed_priority(Initial ; EveryT)

-- Requirement TB.2
assert 	EnterExactly(Communication_RC)
		[FD=
		T_AggregationSoftware_VS
```

#### 3\) No time is spent in the state `Broadcast` of state machine `Communication`.

In order to be able to `receive` or `broadcast` every time unit, except for when the robot does its own `broadcast` every `RC` units, we check that no time is spent in state `Broadcast` via the following assertion.

```
-- Requirement TB.3
assert 	CommunicationStateSpent(0,"Communication_Broadcast")
		[FD=
		T_AggregationSoftware_VS
```

#### 4\) Initially, and then after exactly `RC` time units, when a `broadcast.Communication_id` happens, then the events `broadcast` and `receive` are offered before `RC` time units elapse.

We define the following process `NoEvent`, where we first allow any event nondeterministically in `AnyOther({|broadcast.Communication_id|})`, and following a `broadcast.Communication_id`, it then behaves as `BroadcastHappened(0)`, which offers `receive` and `broadcast` before `RC` units elapse. If `receive` or `broadcast` happen, then any event is offered until `RC` units elapse. After the elapsing of `RC` units, the process behaves as `NoEvent` once more.

```
NoEvent = AnyOther({|broadcast.Communication_id|}) ; BroadcastHappened(0)

BroadcastHappened(t) = (t < Communication_RC & (broadcast ?x-> SomeHappened(t) 
				[] 
				receive?x:{x|x <- {(Communication_id,x0) | x0 <- ID}} -> SomeHappened(t) 
				[] 
				tock -> BroadcastHappened(t+1)))
			[]
			t == Communication_RC & NoEvent

SomeHappened(t) = t < Communication_RC & (AnyOther({tock}) ; SomeHappened(t+1))
		[]
		t == Communication_RC & NoEvent
```
We then check that `NoEvent` in interleaving with the process that offers `moveCall`, `moveRet`, `obstacle` and `tock` nondeterministically, is refined by `T_AggregationSoftware`. The events `moveCall`, `moveRet` and `obstacle` are kept visible in `T_AggregationSoftware` as hiding them would introduce unwanted divergences for this check.
```
-- Requirement TB.4
assert CHAOS({|moveCall,moveRet,obstacle,tock|}) [| {tock} |] NoEvent [FD= T_AggregationSoftware
```

#### 5\) After every `MB` time units, the state `Turning` in the state machine `Movement` is entered.

The cyclic period `MB` of the state machine `Movement` can be captured by requiring that the state `Turning` is entered every `MB` units.

```
EveryMBEnterTurning =
let
Main = ADeadline({|Movement_enterV."Movement_Turning"|},Movement_MB) ; Main
within
timed_priority(Main)

-- Requirement TB.5
assert EveryMBEnterTurning [FD= T_AggregationSoftware_VS
```

#### 6\) Every time state `MovementAndAvoidance` is entered, up to `MB` time units are spent in this state.

To capture the maximum allowed time spent in a certain state of state machine `Movement`, we define the following CSP process `MovementStateSpent(t,x)`.

```
MovementStateSpent(t,x) =
let
Main = AnyOther({|Movement_enterV.x|}) ; ADeadline({|Movement_exitV.x|},t) ; Main
within
timed_priority(Main)
```

For example, the following assertion encodes the requirement that state `MovementAndAvoidance` does not take more than `MB` time units, which could disrupt the cyclic behaviour of state `Turning`.

```
-- Requirement TB.6
assert MovementStateSpent(Movement_MB,"Movement_MovementAndAvoidance") [FD= T_AggregationSoftware_VS
```

#### 7\) No more than `360/av` time units are spent in the state `Avoid` of the state-machine `Movement`.

Given that `random()` ranges over the real interval `0..1`, and that the transition from `Avoid` to `Move` should be taken immediately once the entry action of the state `Avoid` is completed, the state `Avoid` should be left in no more than 360/av time units. This is a derived property taking into account the definition of the behaviour in the state `Avoid` in terms of `random()`.

```
-- Requirement TB.7
assert MovementStateSpent(360/Movement_av,"Movement_MovementAndAvoidance_Avoid")
[FD=
T_AggregationSoftware_VS
```

#### 8\) No more than `360/av` time units are spent in the state `Turning` of state-machine `Movement`.

Similarly to the previous requirement, we require that once the state `Turning` has been entered, no more than `360/av` time units are spent in that state.

```
-- Requirement TB.8
assert MovementStateSpent(360/Movement_av,"Movement_Turning") [FD= T_AggregationSoftware_VS
```

# <a name="revision0"></a>Analysis of model revision 0 ([download](AlphaAlgorithm_Timed_Revision0.zip))

Here we analyse the initial version of the Alpha Algorithm model as presented in the introduction. Not surprisingly, the issues
already raised there show up here again. 

To make the conditions using `random()` analysable, we make random range over the interval from `0` to `1`. This is
a limitation of the encoding of reals as a finite set, and the fact that `FDR` does not handle fixed or floating point types. An alternative that could be considered would include an encoding of rational numbers.

We consider `RC = 1` and `MB = 1`.

### A\)

| Requirement | Result| Notes |
| :--- | :--- | :---  |
| A.1  | fail |       |
| A.2  | pass |       |
| A.3  | -    | \[2\] |
| A.4  | pass |       |
| A.5  | pass |       |
| A.6  | - 	  | \[2\] | 
| A.7  | pass | \[1\] |
| A.8  | pass | \[1\] |
| A.9  | -    | \[1,2\] | 

\[1\]: These results are only tractable due to the selective application of FDR's `wbisim` compression
function.

\[2\]: In the timed model we can ascertain the absense of time locks, but not the absence, in general, of deadlocks.

\[A.1\]: Fails just like in the untimed model because, once `since(RCC) >= RC` is true, the transition from 
`Receive`to `Broadcast` competes nondeterministically with the self-transitions on state `Receive`. To make `Communication` deterministic the self-transitions need to be disabled once `since(RCC) >= RC` is true.

### B\)

| Requirement | Result | Notes |
| :--- | :--- | :---   | 
| B.1  | pass |        |   
| B.2  | pass |        |

### TA\)

| Requirement | Result | Notes |
| :--- | :--- | :---   |
| TA.1 | pass  |  \[2\]      |
| TA.2 | pass |        |
| TA.3 | pass |        |
| TA.4 | pass |        |

### TB\)

| Requirement | Result | Notes |
| :--- | :--- | :--- |
| TB.1 | fail | |
| TB.2 | fail | |
| TB.3 | fail | |
| TB.4 | fail | |
| TB.5 | fail | |
| TB.6 | fail | |
| TB.7 | pass | |
| TB.8 | fail | |

\[TB.1\]: Fails because there is no guarantee that once in state `Receive` the event `receive` takes place immediately, and so more than `RC` time units can be spent in state `Receive` violating requirement TB.1.

\[TB.2\]: Similarly to TB.1, TB.2 fails because there is no requirement on `broadcast` to take place immediately in state `Broadcast`, so it is not necessarily the case that state `Receive` is entered every `RC` time units.

\[TB.3\]: Similarly to TB.2, TB.3 fails because it is not possible to guarantee that no time is spent in state `Broadcast` as there is no deadline on the event `broadcast`.

\[TB.4\]: Fails because exactly after `RC` units have passed, there is a nondeterminism between transitioning to state `Broadcast` or allowing another self-transition on state `Receive`, such as `broadcast` with a different ID other than `Communication_ID`, to take place.

\[TB.5\]: Fails because there is no guarantee that the transition from state `MovementAndAvoid` is taken exactly after `since(MBC) >= MB` is true. Namely, if the robot detects an `object` then the avoidance takes some time, which is always allowed to happen. Therefore, an appropriate condition on the transition from `Move` to `Avoid` would be `since(MBC) < MB - 360/av`, with the caveat that `MB` itself must satisfy `MB - 360/av >= 0`, so `MB >= 360/av`. And in order to at least offer the possibility to treat the `object` event for at least one time unit, `MB > 360/av`.

Even if we fix the condition on the assertion from `Move` to `Avoid`, there is still a problem with the lack of clock resets on the transitions between states `MovementAndAvoid` and `Turning`. The appropriate change, incorporating the suggestion described here, is to have a clock reset on the transition from state `MovementAndAvoid` to state `Turning`. In this way the clock `MBC` also reflects the time since entering state `Turning` and together with the condition `since(MBC) <= MB - 360/av` guarantees that the transition on `obstacle` does not compete with the timed trigger.

To fully satisfy the requirement, however, it is necessary to make sure that `MB < EE`, where `EE` is the worst-case time taken by state `Turning`, which, overall depends on `RCC` as well.

\[TB.6\]: Fails because once an `obstacle` is detected, it is no longer the case that the transition from `MovementAndAvoid` to state `Turning` is triggered after `MB` units. Similarly to requirement `TB.5` this property cannot be satisfied unless the transition on `obstacle` is guarded by `since(MBC) < MB -360/av` so that no more than `MB` units are ever spent in state `MovementAndAvoidance`.

\[TB.8\]: Fails because the state-machine `Movement` may not be able to receive a value through the event `neighbours` immediately, and so it could spend an unbounded amount of time in state `Turning`.

# <a name="revision1"></a>Analysis of model revision 1 ([download](AlphaAlgorithm_Timed_Revision1.zip))

To cater for requirement `A.1` we change the transitions out of state `Receive`, on state machine `Communication`, to be guarded with a conjunction on `since(RCC)<RC` so that they do not compete with the guarded transition from `Receive` to `Broadcast`. We adopt the following changes to state-machine `Communication`:

* The entry action `broadcast!id` is annotated with deadline `0`.
* Self-transition on state `Receive` with trigger `broadcast` is guarded by `[since(RCC)<RC]`.
* Self-transition on state `Receive` with trigger `receive` is guarded with a conjunction with `sinceRCC<RC`.

To cater for the other requirements, we adjust the transitions in the state machine `Communication` as follows:

* The action following the self-transition on state `Receive` with trigger `broadcast` is annotated with deadline `0`.

We also adjust the transitions in state machine `Movement` as follows:

* The transition from `Move` to `Avoid` is guarded with the condition `since(MBC) < MB-360/av`, so that `obstacle` is offered before `MB` time units have passed since the last reset of clock `MBC` and any time that could be taken by state `Avoid` \(which in the worst case is `360/av`\).
* The transition from `MovementAndAvoidance` to state `Turning` has a reset on clock `MBC` added, so that the time spent by state `Turning` can be taken into account for the purpose of the cyclic execution.

We also note that 

* The constant `MB` must be greater than `360/av`.

The changed diagrams are reproduced below.

![](timed_aggregation_1.png){:width="100%"}
![](timed_communication_1.png){:width="100%"}

For the purpose of our analysis we consider consider `RC = 360/av+1` and `MB = 360/av+1`.

### A\)

| Requirement | Result | Notes |
| :--- | :--- | :--- |
| A.1 | pass | |
| A.2 | pass | |
| A.3 | -    | |
| A.4 | pass | |
| A.5 | pass | |
| A.6 | -    | |
| A.7 | pass | |
| A.8 | pass | |
| A.9 | -    | |

### B\)

| Requirement | Result | Notes |
| :--- | :--- | :--- |
| B.1 | ? | \[3\]|
| B.2 | ? | \[3\]|

\[3\]: Unable to verify due to abortion in FDR's execution.

### TA\)

| Requirement | Result | Notes |
| :--- | :--- | :--- |
| TA.1 | pass | \[4\] |
| TA.2 | pass | |
| TA.3 | pass | |
| TA.4 | pass | |

\[4\]: Result is conditional on hiding the events `Communication_receive`, `Communication_robots` and `receive` in the checks, as these events now have deadlines imposed on them and thus result in visible timelocks. The updated assertions are listed below.
```
-- Requirement TA.1 [modified to cater for known timelocks caused by deadlines]
TA_ExternalEvents_Communication_WithoutDeadlines = {|Communication_robots|}
TA_ExternalEvents_AggregationSoftware_WithoutDeadlines = {|obstacle|}

assert RUN({tock}) ||| CHAOS(TA_ExternalEvents_Communication_WithoutDeadlines) [F= T_Communication |\ union(TA_ExternalEvents_Communication_WithoutDeadlines,{tock})
assert RUN({tock}) ||| CHAOS(TA_ExternalEvents_AggregationSoftware_WithoutDeadlines) [F= T_AggregationSoftware |\ union(TA_ExternalEvents_AggregationSoftware_WithoutDeadlines,{tock})
```

### TB\)

| Requirement | Result | Notes |
| :--- | :--- | :--- |
| TB.1 | pass | |
| TB.2 | pass | |
| TB.3 | pass | |
| TB.4 | pass | |
| TB.5 | pass | |
| TB.6 | pass | |
| TB.7 | pass | |
| TB.8 | pass | |

# <a name="simver">Simulation Verification</a> ([download](AlphaAlgorithm-Simulation-Verification.zip))

The [project file](AlphaAlgorithm-Simulation-Verification.zip) contains a manually generated semantics of the simulation for the Alpha Algorithm example, focusing on the Movement machine, as well as its correctness verification.

The simulation was verified against the RoboChart model with assumptions `TA1`, `TA2` and `TA3`.

The file with the CSP models and verification assertions is:
`src-gen/timed/AlphaAlgorithm_assertionsVerification.csp`

The interested reader can load this file in the FDR4 tool and check the assertions.
The relevant assertions are:

```
assert PMConstrainedSpecA3 \ ExternalEvents_System [FD= SimSpec
assert SimSpec [FD= PMConstrainedSpecA3 \ ExternalEvents_System
```

They assert that the manually generated simulation model for the Movement machine 
(`SimSpec`) has the same behaviour (in the Failures-Divergences model of CSP) as the
RoboChart model with the assumptions. 

<script src="popup.js">
</script>